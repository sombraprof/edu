import type { Meta, StoryObj } from '@storybook/vue3';
import BalancedScorecard from './BalancedScorecard.vue';

const meta: Meta<typeof BalancedScorecard> = {
  title: 'Lesson/Blocks/BalancedScorecard',
  component: BalancedScorecard,
  args: {
    title: 'Mapa estratégico de SI',
    summary:
      'Conecta objetivos, indicadores e iniciativas nas quatro perspectivas do Balanced Scorecard aplicado à área de Sistemas de Informação.',
    perspectives: [
      {
        id: 'finance',
        title: 'Financeira',
        summary:
          'Garante retorno sobre investimentos em tecnologia e otimização de custos operacionais.',
        tone: 'primary',
        badge: 'Financeira',
      },
      {
        id: 'customer',
        title: 'Clientes',
        summary: 'Eleva a experiência digital e a percepção de valor das áreas de negócio.',
        tone: 'info',
        badge: 'Clientes',
      },
      {
        id: 'process',
        title: 'Processos Internos',
        summary: 'Fortalece confiabilidade, segurança e velocidade das entregas de TI.',
        tone: 'warning',
        badge: 'Processos',
      },
      {
        id: 'learning',
        title: 'Aprendizado e Inovação',
        summary: 'Desenvolve competências, cultura ágil e ecossistemas de inovação.',
        tone: 'success',
        badge: 'Aprendizado',
      },
    ],
    objectives: [
      {
        id: 'reduce-cost',
        perspectiveId: 'finance',
        title: 'Reduzir custo por transação digital',
        summary: 'Revisar contratos e ampliar automação para reduzir despesas recorrentes.',
        owner: 'Diretoria de TI',
      },
      {
        id: 'improve-nps',
        perspectiveId: 'customer',
        title: 'Elevar NPS das soluções digitais',
        summary: 'Promover jornadas omnicanal e suporte proativo ao usuário.',
        owner: 'Head de Produtos Digitais',
      },
      {
        id: 'increase-uptime',
        perspectiveId: 'process',
        title: 'Aumentar disponibilidade crítica',
        summary: 'Ampliar observabilidade e planos de contingência para serviços prioritários.',
        owner: 'Gerência de Operações',
        initiatives: [
          'Renovar arquitetura de alta disponibilidade',
          'Criar runbooks automatizados',
        ],
      },
      {
        id: 'accelerate-delivery',
        perspectiveId: 'process',
        title: 'Reduzir tempo de entrega',
        summary: 'Adotar práticas DevOps e gestão de fluxo contínuo.',
        owner: 'PMO Digital',
      },
      {
        id: 'scale-analytics',
        perspectiveId: 'learning',
        title: 'Escalar competências em analytics',
        summary: 'Desenvolver trilhas de dados e comunidades de prática.',
        owner: 'CoE Analytics',
      },
      {
        id: 'foster-innovation',
        perspectiveId: 'learning',
        title: 'Fomentar inovação aberta',
        summary: 'Criar pipeline contínuo de pilotos com parceiros e startups.',
        owner: 'Líder de Inovação',
      },
    ],
    indicators: [
      {
        id: 'cost-per-transaction',
        objectiveId: 'reduce-cost',
        title: 'Custo médio por transação',
        target: '-15%',
        current: '-6%',
        frequency: 'Mensal',
        owner: 'Controladoria de TI',
        status: 'at-risk',
      },
      {
        id: 'digital-nps',
        objectiveId: 'improve-nps',
        title: 'NPS digital',
        target: '≥ 65',
        current: '61',
        frequency: 'Mensal',
        owner: 'CX Office',
        status: 'on-track',
      },
      {
        id: 'uptime',
        objectiveId: 'increase-uptime',
        title: 'Disponibilidade 24x7',
        target: '≥ 99,8%',
        current: '99,4%',
        frequency: 'Semanal',
        owner: 'SRE',
        status: 'at-risk',
      },
      {
        id: 'lead-time',
        objectiveId: 'accelerate-delivery',
        title: 'Lead time de squads',
        target: '-25%',
        current: '-12%',
        frequency: 'Quinzenal',
        owner: 'Agile Office',
        status: 'off-track',
      },
      {
        id: 'certified-teams',
        objectiveId: 'scale-analytics',
        title: '% equipes certificadas',
        target: '≥ 70%',
        current: '54%',
        frequency: 'Trimestral',
        owner: 'RH Tech',
        status: 'not-started',
      },
      {
        id: 'innovation-pocs',
        objectiveId: 'foster-innovation',
        title: 'Provas de conceito/ano',
        target: '≥ 6',
        current: '4',
        frequency: 'Trimestral',
        owner: 'Lab de Inovação',
        status: 'on-track',
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof BalancedScorecard>;

export const Default: Story = {
  render: (args) => ({
    components: { BalancedScorecard },
    setup() {
      return { args };
    },
    template: `
      <div class="lesson-block-story" style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
        <BalancedScorecard v-bind="args" />
      </div>
    `,
  }),
};
