import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'APIs Du Projet Entreprenapp',
      version: '1.0.0',
      description: 'EntreprenApp est une plateforme web innovante conçue pour catalyser le développement entrepreneurial \
et communautaire. Notre mission est de connecter efficacement les différents acteurs de l\'écosystème \
entrepreneurial (entrepreneurs, investisseurs, startups, organisations et universités) en leur offrant un \
espace où ils peuvent interagir, collaborer et maximiser leurs opportunités. \
Grâce à un algorithme intelligent, EntreprenApp garantit que chaque utilisateur ne voit que les \
informations pertinentes pour lui. Cela permet aux investisseurs de découvrir des projets alignés avec \
leurs critères d\'investissement, aux entrepreneurs/startups de postuler à des appels à projets adaptés, et \
aux organisations/universités de diffuser leurs initiatives stratégiques',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };