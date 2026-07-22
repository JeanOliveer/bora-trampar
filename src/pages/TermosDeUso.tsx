import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mt-8">
    <h2 className="text-lg font-bold text-white break-words">{title}</h2>
    <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/85 break-words [overflow-wrap:anywhere]">
      {children}
    </div>
  </section>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="break-words [overflow-wrap:anywhere]">{children}</p>
);

const List = ({ items }: { items: string[] }) => (
  <ul className="list-disc space-y-1.5 pl-5 break-words [overflow-wrap:anywhere]">
    {items.map((it) => (
      <li key={it}>{it}</li>
    ))}
  </ul>
);

const TermosDeUso = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-[#005e91] via-[#004a73] to-[#00314d] text-white">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/[0.04]" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-white/[0.03]" />

      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/10 bg-[#005e91]/70 px-4 py-3 backdrop-blur-md">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 transition-all active:scale-95"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4 text-white" />
        </button>
        <h1 className="text-base font-bold tracking-tight">Termos de Uso</h1>
      </header>

      <main className="mx-auto w-full max-w-2xl px-5 pb-16 pt-6">
        <p className="text-xs font-medium text-white/60">Última atualização: 22 de julho de 2026</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight break-words">TERMOS DE USO — UAI TRAMPO</h2>

        <div className="mt-5 space-y-3 text-sm leading-relaxed text-white/85 break-words [overflow-wrap:anywhere]">
          <P>Bem-vindo ao Uai Trampo.</P>
          <P>
            Estes Termos de Uso estabelecem as regras e condições para utilização da plataforma Uai Trampo,
            incluindo seu aplicativo, site e demais serviços disponibilizados pela plataforma.
          </P>
          <P>
            Ao criar uma conta, acessar ou utilizar o Uai Trampo, o usuário declara que leu, compreendeu e
            concorda com estes Termos de Uso e com a Política de Privacidade aplicável à plataforma.
          </P>
          <P>Caso não concorde com estes termos, o usuário não deverá utilizar os serviços disponibilizados pelo Uai Trampo.</P>
        </div>

        <Section title="1. Sobre o Uai Trampo">
          <P>
            O Uai Trampo é uma plataforma digital criada para facilitar a conexão entre pessoas interessadas
            em realizar serviços e oportunidades de trabalho por diária ou por serviço e pessoas ou empresas
            interessadas em contratar esses serviços.
          </P>
          <P>
            A plataforma tem como objetivo facilitar a divulgação de oportunidades, a candidatura de
            trabalhadores, a comunicação entre as partes, o acompanhamento dos serviços e a avaliação das
            experiências realizadas.
          </P>
          <P>
            O Uai Trampo atua como uma plataforma de conexão entre usuários e não garante a contratação, a
            realização ou a continuidade de qualquer serviço.
          </P>
        </Section>

        <Section title="2. Cadastro e criação de conta">
          <P>
            Para utilizar determinadas funcionalidades do Uai Trampo, o usuário deverá criar uma conta e
            fornecer informações verdadeiras, completas e atualizadas.
          </P>
          <P>
            O usuário é responsável pela veracidade das informações fornecidas durante o cadastro e pela
            atualização de seus dados sempre que necessário.
          </P>
          <P>Cada usuário deverá utilizar sua própria conta e não poderá compartilhar suas credenciais de acesso com terceiros.</P>
          <P>O usuário é responsável por manter sua senha e demais informações de acesso em segurança.</P>
          <P>Caso identifique qualquer acesso não autorizado à sua conta, o usuário deverá comunicar o Uai Trampo imediatamente.</P>
          <P>
            O Uai Trampo poderá solicitar informações ou documentos adicionais para verificar a identidade dos
            usuários e aumentar a segurança da plataforma.
          </P>
        </Section>

        <Section title="3. Perfil do usuário">
          <P>O usuário deverá manter seu perfil atualizado e fornecer informações verdadeiras.</P>
          <P>
            É proibido utilizar informações falsas, documentos pertencentes a terceiros ou qualquer informação
            com o objetivo de enganar outros usuários.
          </P>
          <P>O Uai Trampo poderá solicitar documentos de identificação para fins de verificação e segurança da plataforma.</P>
          <P>A apresentação de documentos ou informações não garante automaticamente a aprovação ou contratação do usuário.</P>
        </Section>

        <Section title="4. Vagas e ofertas de serviços">
          <P>
            Os serviços publicados na plataforma deverão apresentar informações verdadeiras e suficientes para
            que os interessados possam compreender a atividade oferecida.
          </P>
          <P>O responsável pela publicação do serviço deverá informar, sempre que aplicável, informações como:</P>
          <List
            items={[
              "Descrição da atividade;",
              "Data e horário;",
              "Local de realização;",
              "Valor ou forma de pagamento;",
              "Requisitos necessários;",
              "Outras informações relevantes para a execução do serviço.",
            ]}
          />
          <P>
            O Uai Trampo poderá remover ou bloquear anúncios que violem estes Termos de Uso, apresentem
            informações falsas ou possam representar risco aos usuários.
          </P>
        </Section>

        <Section title="5. Candidatura a serviços">
          <P>O usuário interessado em realizar um serviço poderá se candidatar às oportunidades disponíveis na plataforma.</P>
          <P>A candidatura não garante a contratação.</P>
          <P>
            A decisão de selecionar ou não um candidato será realizada pelo responsável pela oportunidade, de
            acordo com os critérios aplicáveis ao serviço.
          </P>
          <P>O usuário deverá fornecer informações verdadeiras durante o processo de candidatura.</P>
          <P>
            O envio de documentos falsos, informações fraudulentas ou dados pertencentes a terceiros poderá
            resultar na suspensão ou encerramento da conta.
          </P>
        </Section>

        <Section title="6. Contratação e realização do serviço">
          <P>
            A contratação de um usuário ocorre quando o responsável pelo serviço seleciona e confirma sua
            contratação por meio da plataforma ou por outros meios acordados entre as partes.
          </P>
          <P>O usuário contratado deverá comparecer ao local e horário combinados e realizar as atividades acordadas.</P>
          <P>
            O responsável pela contratação deverá fornecer informações adequadas sobre o serviço e cumprir as
            condições de pagamento previamente acordadas.
          </P>
          <P>
            O Uai Trampo não garante a qualidade, segurança, legalidade ou conclusão dos serviços realizados
            entre os usuários, salvo quando determinada funcionalidade ou serviço específico da plataforma
            estabelecer expressamente uma responsabilidade diferente.
          </P>
        </Section>

        <Section title="7. Confirmação de presença e chegada">
          <P>
            Quando disponibilizada pela plataforma, a funcionalidade de confirmação de chegada poderá ser
            utilizada para registrar a presença do trabalhador no local do serviço.
          </P>
          <P>O trabalhador poderá informar sua chegada por meio da opção disponibilizada no aplicativo.</P>
          <P>O responsável pelo serviço poderá confirmar a chegada do trabalhador.</P>
          <P>
            Os registros realizados na plataforma poderão ser utilizados para fins de organização, histórico,
            segurança e análise de eventuais conflitos.
          </P>
        </Section>

        <Section title="8. Pagamentos">
          <P>
            Quando a plataforma disponibilizar um sistema de pagamento integrado, as condições de utilização,
            taxas, prazos e regras específicas serão apresentadas ao usuário antes da realização da transação.
          </P>
          <P>O usuário deverá fornecer informações de pagamento verdadeiras e atualizadas.</P>
          <P>
            Quando houver pagamento realizado por meio da plataforma, o processamento poderá depender de
            serviços de terceiros especializados em pagamentos.
          </P>
          <P>
            O Uai Trampo poderá estabelecer mecanismos de retenção, liberação ou estorno de valores conforme
            as regras específicas da funcionalidade utilizada.
          </P>
          <P>
            Em situações de cancelamento, não comparecimento ou descumprimento do serviço, poderão ser
            aplicadas regras específicas de reembolso ou liberação de valores, conforme as condições
            apresentadas no momento da contratação.
          </P>
        </Section>

        <Section title="9. Avaliações e reputação">
          <P>Após a realização de um serviço, os usuários poderão ter acesso a funcionalidades de avaliação e reputação.</P>
          <P>As avaliações devem ser realizadas de maneira honesta, respeitosa e baseada na experiência real do serviço realizado.</P>
          <P>É proibido utilizar avaliações para:</P>
          <List
            items={[
              "Difamar ou ameaçar outros usuários;",
              "Publicar informações falsas;",
              "Praticar discriminação;",
              "Realizar perseguição ou assédio;",
              "Manipular artificialmente a reputação de um usuário.",
            ]}
          />
          <P>O Uai Trampo poderá analisar, ocultar ou remover avaliações que violem estes Termos de Uso.</P>
          <P>
            As avaliações e pontuações poderão influenciar a reputação, visibilidade ou classificação dos
            usuários dentro da plataforma, conforme as regras do sistema de reputação vigente.
          </P>
        </Section>

        <Section title="10. Cancelamentos e não comparecimento">
          <P>Os usuários deverão comunicar eventuais cancelamentos com antecedência sempre que possível.</P>
          <P>
            O não comparecimento injustificado a um serviço confirmado poderá resultar em consequências dentro
            da plataforma, incluindo redução de pontuação ou reputação, conforme as regras aplicáveis.
          </P>
          <P>Cancelamentos de última hora também poderão resultar em penalidades.</P>
          <P>As penalidades poderão variar de acordo com a frequência e gravidade das ocorrências.</P>
          <P>Em casos excepcionais, o usuário poderá apresentar uma justificativa para análise.</P>
          <P>O Uai Trampo poderá analisar situações específicas e, quando aplicável, remover ou ajustar penalidades.</P>
        </Section>

        <Section title="11. Sistema de pontuação e níveis">
          <P>
            O Uai Trampo poderá utilizar sistemas de avaliação, pontuação e classificação para auxiliar na
            construção da reputação dos usuários.
          </P>
          <P>
            Os critérios de pontuação poderão ser alterados ou atualizados pela plataforma para melhorar a
            experiência e a segurança dos usuários.
          </P>
          <P>As avaliações poderão influenciar a classificação e a visibilidade de um perfil dentro da plataforma.</P>
          <P>A pontuação não representa uma garantia de contratação, qualidade profissional ou resultado futuro.</P>
        </Section>

        <Section title="12. Conduta dos usuários">
          <P>É proibido utilizar o Uai Trampo para:</P>
          <List
            items={[
              "Praticar atividades ilegais;",
              "Aplicar golpes ou fraudes;",
              "Fornecer informações falsas;",
              "Utilizar documentos falsificados;",
              "Utilizar a conta de outra pessoa;",
              "Assediar, ameaçar ou intimidar outros usuários;",
              "Praticar discriminação;",
              "Publicar conteúdo ofensivo ou ilegal;",
              "Tentar obter dados pessoais de outros usuários de maneira indevida;",
              "Utilizar a plataforma para atividades que coloquem terceiros em risco;",
              "Manipular avaliações ou sistemas de reputação;",
              "Utilizar sistemas automatizados para prejudicar o funcionamento da plataforma;",
              "Tentar acessar áreas ou informações sem autorização.",
            ]}
          />
          <P>O descumprimento dessas regras poderá resultar em advertência, suspensão ou encerramento da conta.</P>
        </Section>

        <Section title="13. Segurança dos usuários">
          <P>O Uai Trampo recomenda que os usuários adotem medidas de segurança durante a utilização da plataforma.</P>
          <P>Os usuários devem avaliar cuidadosamente as informações recebidas antes de aceitar um serviço ou realizar uma contratação.</P>
          <P>Sempre que possível, recomenda-se verificar a identidade das pessoas envolvidas e confirmar previamente as condições do serviço.</P>
          <P>
            O Uai Trampo poderá implementar mecanismos de verificação e segurança para reduzir riscos, mas não
            pode garantir que todos os usuários sejam legítimos ou que nenhuma fraude ocorrerá.
          </P>
          <P>Caso um usuário identifique uma atividade suspeita, deverá comunicar a plataforma por meio dos canais oficiais de atendimento.</P>
        </Section>

        <Section title="14. Privacidade e proteção de dados">
          <P>O tratamento de dados pessoais realizado pelo Uai Trampo será realizado conforme sua Política de Privacidade e a legislação aplicável.</P>
          <P>
            Os dados poderão ser utilizados para criar e administrar contas, permitir o funcionamento das
            funcionalidades da plataforma, realizar verificações de segurança, melhorar os serviços e cumprir
            obrigações legais.
          </P>
          <P>
            O usuário poderá consultar a Política de Privacidade para obter informações detalhadas sobre a
            coleta, utilização, armazenamento e proteção de seus dados pessoais.
          </P>
        </Section>

        <Section title="15. Conteúdo publicado pelos usuários">
          <P>
            Os usuários poderão publicar informações, descrições, avaliações, imagens e outros conteúdos
            dentro da plataforma, desde que possuam autorização para utilizá-los e que esses conteúdos estejam
            de acordo com estes Termos de Uso.
          </P>
          <P>O usuário é responsável pelo conteúdo que publicar.</P>
          <P>O Uai Trampo poderá remover conteúdos que violem estes Termos de Uso, a legislação aplicável ou os direitos de terceiros.</P>
        </Section>

        <Section title="16. Propriedade intelectual">
          <P>
            O Uai Trampo, incluindo sua marca, identidade visual, nome, logotipo, software, interface,
            funcionalidades e demais elementos desenvolvidos pela plataforma, são protegidos pela legislação
            aplicável.
          </P>
          <P>
            É proibido copiar, modificar, reproduzir, distribuir ou utilizar os elementos do Uai Trampo sem
            autorização prévia, salvo quando permitido pela legislação.
          </P>
          <P>O uso da plataforma não concede ao usuário qualquer direito de propriedade sobre a marca, software ou demais elementos pertencentes ao Uai Trampo.</P>
        </Section>

        <Section title="17. Disponibilidade da plataforma">
          <P>O Uai Trampo buscará manter a plataforma disponível e funcionando adequadamente.</P>
          <P>
            Entretanto, poderão ocorrer interrupções temporárias decorrentes de manutenção, atualizações,
            falhas técnicas, problemas de conexão, serviços de terceiros ou eventos fora do controle da
            plataforma.
          </P>
          <P>O Uai Trampo poderá modificar, atualizar, suspender ou encerrar funcionalidades da plataforma quando necessário.</P>
        </Section>

        <Section title="18. Limitação de responsabilidade">
          <P>O Uai Trampo atua como uma plataforma de conexão entre usuários.</P>
          <P>Salvo quando expressamente previsto em lei ou em condições específicas de determinado serviço, o Uai Trampo não é responsável por:</P>
          <List
            items={[
              "Acordos realizados diretamente entre usuários;",
              "Qualidade ou resultado dos serviços;",
              "Informações falsas fornecidas por usuários;",
              "Danos causados pela conduta de usuários;",
              "Cancelamentos ou não comparecimentos;",
              "Disputas entre contratantes e trabalhadores;",
              "Problemas decorrentes de informações incorretas fornecidas pelos usuários.",
            ]}
          />
          <P>Os usuários são responsáveis por suas próprias decisões e pelos acordos realizados.</P>
        </Section>

        <Section title="19. Suspensão e encerramento de contas">
          <P>O Uai Trampo poderá suspender ou encerrar uma conta quando identificar:</P>
          <List
            items={[
              "Violação destes Termos de Uso;",
              "Fraude ou tentativa de fraude;",
              "Uso de documentos falsos;",
              "Comportamento que coloque outros usuários em risco;",
              "Uso indevido da plataforma;",
              "Descumprimento reiterado das regras.",
            ]}
          />
          <P>Sempre que aplicável e possível, o usuário poderá ser informado sobre o motivo da suspensão ou encerramento.</P>
        </Section>

        <Section title="20. Alterações dos Termos de Uso">
          <P>O Uai Trampo poderá atualizar estes Termos de Uso para refletir mudanças na plataforma, na legislação ou nos serviços oferecidos.</P>
          <P>A versão atualizada será disponibilizada dentro da plataforma.</P>
          <P>Quando necessário, os usuários poderão ser comunicados sobre alterações relevantes.</P>
          <P>A continuidade de utilização da plataforma após a atualização dos termos poderá representar a aceitação das novas condições, quando permitido pela legislação aplicável.</P>
        </Section>

        <Section title="21. Atendimento e suporte">
          <P>O usuário poderá entrar em contato com o Uai Trampo por meio dos canais oficiais de atendimento disponibilizados na plataforma.</P>
          <P>O suporte poderá ser utilizado para dúvidas, denúncias, problemas técnicos e solicitações relacionadas à utilização dos serviços.</P>
        </Section>

        <Section title="22. Legislação aplicável">
          <P>Estes Termos de Uso serão interpretados de acordo com as leis aplicáveis da República Federativa do Brasil.</P>
          <P>Eventuais conflitos relacionados à utilização da plataforma deverão ser tratados conforme a legislação brasileira aplicável.</P>
        </Section>

        <Section title="23. Aceite dos termos">
          <P>Ao criar uma conta ou utilizar o Uai Trampo, o usuário declara que leu e compreendeu estes Termos de Uso e concorda com as condições aqui estabelecidas.</P>
          <P>Caso o usuário não concorde com estes termos, deverá interromper a utilização da plataforma.</P>
        </Section>

        <div className="mt-10 border-t border-white/10 pt-6 text-center">
          <p className="text-sm font-semibold text-white">Uai Trampo</p>
          <p className="mt-1 text-xs text-white/60">Última atualização: 22 de julho de 2026</p>
          <Link
            to="/"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-white/10 px-6 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-md transition-all active:scale-[0.97] hover:bg-white/15"
          >
            Voltar ao início
          </Link>
        </div>
      </main>
    </div>
  );
};

export default TermosDeUso;
