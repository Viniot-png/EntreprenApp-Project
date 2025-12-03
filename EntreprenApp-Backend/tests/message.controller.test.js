import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';

// ESM mocks for modules (jest unstable API for ESM)
const saveMock = jest.fn();
const mockMessageConstructor = function (data) {
  Object.assign(this, data);
  this.save = saveMock.mockResolvedValue({ _id: 'mocked-msg-id', ...data });
};

jest.unstable_mockModule('../models/message.model.js', () => ({
  __esModule: true,
  default: Object.assign(mockMessageConstructor, {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    updateMany: jest.fn().mockResolvedValue({}),
    find: jest.fn(),
    create: jest.fn()
  })
}));

jest.unstable_mockModule('../models/user.model.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findById: jest.fn()
  }
}));

// Cloudinary mock
jest.unstable_mockModule('cloudinary', () => ({
  __esModule: true,
  default: {
    uploader: {
      upload: jest.fn().mockResolvedValue({ secure_url: 'https://example.com/image.jpg' }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
    }
  }
}));

let Message;
let User;
let SendMessage;
let UpdateMessage;
let DeleteMessage;

// (cloudinary mocked above with unstable_mockModule)

describe('Message controller (send / update / delete)', () => {
  let mongoServer;

  beforeAll(async () => {
    // Import mocked model modules so we can set return values in tests
    const messageModule = await import('../models/message.model.js');
    Message = messageModule.default;
    const userModule = await import('../models/user.model.js');
    User = userModule.default;
    // Import controllers after models are mocked
    const controllerModule = await import('../controllers/message.controller.js');
    SendMessage = controllerModule.SendMessage;
    UpdateMessage = controllerModule.UpdateMessage;
    DeleteMessage = controllerModule.DeleteMessage;
  });

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test('SendMessage should create save and return new message (201)', async () => {
    const sender = { _id: '507f1f77bcf86cd799439011' };
    const receiver = { _id: '507f1f77bcf86cd799439012' };
    User.create.mockResolvedValueOnce(sender);
    User.create.mockResolvedValueOnce(receiver);

    const req = httpMocks.createRequest({
      method: 'POST',
      url: `/api/message/send/${receiver._id}`,
      params: { id: receiver._id.toString() },
      body: { text: 'Hello Bob' },
      user: { _id: sender._id }
    });

    const res = httpMocks.createResponse();
    await SendMessage(req, res);

    expect(res.statusCode).toBe(201);
    const payload = res._getJSONData();
    expect(payload.success).toBe(true);
    expect(payload.data.text).toBe('Hello Bob');
    expect(payload.data.senderId).toBeDefined();
    expect(payload.data.receiverId).toBeDefined();
  });

  test('UpdateMessage allows sender to edit message text', async () => {
    const sender = { _id: 'sender-2' };
    const receiver = { _id: 'receiver-2' };
    User.create.mockResolvedValueOnce(sender);
    User.create.mockResolvedValueOnce(receiver);

    // Seed message: returned by Message.findById
    const message = { _id: 'msg-update-1', senderId: sender._id, receiverId: receiver._id, text: 'Original', image: null };
    Message.findById.mockResolvedValueOnce(message);
    Message.findByIdAndUpdate.mockResolvedValueOnce({ ...message, text: 'Updated text' });

    const req = httpMocks.createRequest({
      method: 'PUT',
      url: `/api/message/update/${message._id}`,
      params: { id: message._id.toString() },
      body: { text: 'Updated text' },
      user: { _id: sender._id }
    });
    const res = httpMocks.createResponse();

    await UpdateMessage(req, res);

    expect(res.statusCode).toBe(200);
    const payload = res._getJSONData();
    expect(payload.success).toBe(true);
    expect(payload.data.text).toBe('Updated text');
  });

  test('UpdateMessage forbids edits by non-senders (403)', async () => {
    const sender = { _id: 'sender-3' };
    const other = { _id: 'other-3' };
    const receiver = { _id: 'receiver-3' };
    User.create.mockResolvedValueOnce(sender);
    User.create.mockResolvedValueOnce(other);
    User.create.mockResolvedValueOnce(receiver);

    const message = { _id: 'msg-update-3', senderId: sender._id, receiverId: receiver._id, text: 'Original' };
    Message.findById.mockResolvedValueOnce(message);

    const req = httpMocks.createRequest({
      method: 'PUT',
      url: `/api/message/update/${message._id}`,
      params: { id: message._id.toString() },
      body: { text: 'Hacked edit' },
      user: { _id: other._id }
    });
    const res = httpMocks.createResponse();

    await UpdateMessage(req, res);

    expect(res.statusCode).toBe(403);
    const payload = res._getJSONData();
    expect(payload.message).toMatch(/only update your own messages/i);
  });

  test('DeleteMessage deletes a message for its sender and forbids non-senders', async () => {
    const sender = { _id: 'sender-4' };
    const other = { _id: 'other-4' };
    const receiver = { _id: 'receiver-4' };
    User.create.mockResolvedValueOnce(sender);
    User.create.mockResolvedValueOnce(other);
    User.create.mockResolvedValueOnce(receiver);

    const message = { _id: 'msg-delete-1', senderId: sender._id, receiverId: receiver._id, text: 'To delete' };
    // For the first (forbidden) deletion attempt, Message.findById returns message
    Message.findById.mockResolvedValueOnce(message);
    // For the second deletion by sender, Message.findById should return message again first, then after deletion return null
    Message.findById.mockResolvedValueOnce(message);
    Message.findByIdAndDelete.mockResolvedValueOnce({});
    // After delete, findById returns null
    Message.findById.mockResolvedValueOnce(null);

    // Attempt delete by wrong user
    let req = httpMocks.createRequest({ method: 'DELETE', url: `/api/message/delete/${message._id}`, params: { id: message._id.toString() }, user: { _id: other._id } });
    let res = httpMocks.createResponse();
    await DeleteMessage(req, res);
    expect(res.statusCode).toBe(403);

    // Delete by actual sender
    req = httpMocks.createRequest({ method: 'DELETE', url: `/api/message/delete/${message._id}`, params: { id: message._id.toString() }, user: { _id: sender._id } });
    res = httpMocks.createResponse();
    await DeleteMessage(req, res);
    expect(res.statusCode).toBe(200);
    const payload = res._getJSONData();
    expect(payload.success).toBe(true);
    expect(payload.deletedMessageId).toBe(message._id.toString());

    // Ensure message findById returns null after deletion (as mocked)
    const found = await Message.findById(message._id);
    expect(found).toBeNull();
  });
});
