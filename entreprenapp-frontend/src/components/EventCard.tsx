import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Info,
  CreditCard,
  Smartphone,
} from 'lucide-react';
import { Event } from '@/lib/api/services/event.service';

interface EventCardProps {
  event: Event;
  onRegister?: (event: Event) => void;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  showActions?: boolean;
}

const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  XOF: 'CFA',
};

const paymentMethodLabels: Record<string, string> = {
  mobile_money: 'Mobile Money',
  bank_card: 'Carte Bancaire',
  transfer: 'Virement',
};

const paymentMethodIcons: Record<string, React.ReactNode> = {
  mobile_money: <Smartphone className="h-4 w-4" />,
  bank_card: <CreditCard className="h-4 w-4" />,
  transfer: <DollarSign className="h-4 w-4" />,
};

export const EventCard = ({
  event,
  onRegister,
  onEdit,
  onDelete,
  showActions = false,
}: EventCardProps) => {
  const [showDescription, setShowDescription] = useState(false);

  // Normalize image to { url: string, publicId?: string }
  const normalize = (img: any) => {
    if (!img) return null;
    if (typeof img === 'string') return { url: img };
    if (img.url) return { url: img.url, publicId: img.publicId };
    if (img.path) return { url: img.path, publicId: img.publicId };
    if (img.secure_url) return { url: img.secure_url, publicId: img.publicId };
    return null;
  };

  // Use single image
  const image = event.image ? normalize(event.image) : null;

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      {/* Image Display */}
      <div className="relative h-56 bg-muted overflow-hidden">
        {image ? (
          <img
            src={image.url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500">
            <div className="text-white text-center">
              <div className="text-4xl mb-2">📅</div>
              <div className="text-sm">Événement</div>
            </div>
          </div>
        )}
      </div>

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="line-clamp-2 text-xl">{event.title}</CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {event.category || 'Autre'}
              </Badge>
              {event.status && (
                <Badge
                  variant={
                    event.status === 'Upcoming'
                      ? 'default'
                      : event.status === 'Ongoing'
                        ? 'secondary'
                        : 'outline'
                  }
                  className="text-xs"
                >
                  {event.status === 'Upcoming'
                    ? '📅 À venir'
                    : event.status === 'Ongoing'
                      ? '🔴 En cours'
                      : '✓ Terminé'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="line-clamp-1">{event.location}</span>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>
            {startDate.toLocaleDateString('fr-FR', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            -{' '}
            {endDate.toLocaleDateString('fr-FR', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Seats */}
        {event.seats && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>
              {event.registrations?.length || 0} / {event.seats} inscrits
            </span>
          </div>
        )}

        {/* Price and Currency */}
        {event.isPaid && event.price > 0 && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 flex-shrink-0 text-green-600" />
            <span className="font-semibold">
              {event.price} {currencySymbols[event.currency || 'EUR']}
            </span>
          </div>
        )}

        {/* Payment Methods */}
        {event.isPaid && event.paymentMethods && event.paymentMethods.length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Modes de paiement:
            </div>
            <div className="flex flex-wrap gap-2">
              {event.paymentMethods.map((method) => (
                <Badge key={method} variant="secondary" className="text-xs gap-1">
                  {paymentMethodIcons[method] || <CreditCard className="h-3 w-3" />}
                  {paymentMethodLabels[method] || method}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Description Preview */}
        {event.description && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          </div>
        )}

        {/* Organizer */}
        {event.organizer && (
          <div className="flex items-center gap-2 pt-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={event.organizer.profileImage?.url} />
              <AvatarFallback>
                {event.organizer.fullname?.[0] || 'O'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {event.organizer.fullname}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {/* Action Buttons */}
      <div className="px-4 pb-4 space-y-2 mt-auto">
        {/* Description Dialog */}
        {event.description && (
          <Dialog open={showDescription} onOpenChange={setShowDescription}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full"
              >
                <Info className="h-3 w-3 mr-2" />
                Plus de détails
              </Button>
            </DialogTrigger>
              <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{event.title}</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                {event.description?.slice(0, 200) || 'Détails de l\'événement'}
              </DialogDescription>
              <div className="space-y-4">
                {image && (
                  <div className="relative h-48 bg-muted rounded-lg overflow-hidden">
                    <img
                      src={image.url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-sm whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Register Button */}
        {onRegister && (
          <Button
            onClick={() => onRegister(event)}
            className="w-full"
          >
            S'inscrire
          </Button>
        )}

        {/* Action Buttons (Edit/Delete) */}
        {showActions && (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                onClick={() => onEdit(event)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Modifier
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={() => onDelete(event)}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                Supprimer
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default EventCard;
