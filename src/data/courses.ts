// Central registry for available courses shown on Home
// Each entry maps to a folder under public/courses/<id>
export type CourseMeta = {
  id: string;
  title: string;
  institution: string;
  description?: string;
};

export const courses: CourseMeta[] = [
  {
    id: 'algi',
    title: 'Algoritmos e Programação I',
    institution: 'Unichristus',
    description: 'Fundamentos de lógica e programação estruturada para resolver problemas do dia a dia.'
  },
  {
    id: 'tdjd',
    title: 'Tecnologia e Desenvolvimento para Jogos Digitais',
    institution: 'Unichristus',
    description: 'Ferramentas, pipelines e boas práticas para criação de jogos multiplataforma.'
  },
  {
    id: 'ddm',
    title: 'Desenvolvimento para Dispositivos Móveis',
    institution: 'Unichristus',
    description: 'Arquiteturas mobile, publicação e criação de experiências centradas no usuário.'
  },
  {
    id: 'tgs',
    title: 'Teoria Geral de Sistemas',
    institution: 'Unichristus',
    description: 'Pensamento sistêmico aplicado à engenharia de software e gestão tecnológica.'
  },
  {
    id: 'lpoo',
    title: 'Linguagens de Programação Orientada a Objetos',
    institution: 'Unifametro',
    description: 'Modelagem com classes, encapsulamento, herança e padrões de projeto introdutórios.'
  }
];
