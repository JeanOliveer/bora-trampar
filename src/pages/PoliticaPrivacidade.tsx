import { useNavigate } from "react-router-dom";
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

const PoliticaPrivacidade = () => {
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
        <h1 className="text-base font-bold tracking-tight">Política de Privacidade</h1>
      </header>

      <main className="mx-auto w-full max-w-2xl px-5 pb-16 pt-6">
        <p className="text-xs font-medium text-white/60">Última atualização: 22 de julho de 2026</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight break-words">
          POLÍTICA DE PRIVACIDADE — UAI TRAMPO
        </h2>

        <div className="mt-5 space-y-3 text-sm leading-relaxed text-white/85 break-words [overflow-wrap:anywhere]">
          <P>
            A presente Política de Privacidade explica como o Uai Trampo coleta, utiliza, armazena, protege
            e compartilha dados pessoais de seus usuários.
          </P>
          <P>
            O Uai Trampo valoriza a privacidade e a segurança dos dados pessoais de seus usuários e busca
            tratar essas informações de acordo com a legislação aplicável, incluindo a Lei Geral de Proteção
            de Dados Pessoais — LGPD (Lei nº 13.709/2018).
          </P>
          <P>
            Ao utilizar o Uai Trampo, o usuário declara estar ciente das práticas descritas nesta Política
            de Privacidade.
          </P>
        </div>

        <Section title="1. Sobre o Uai Trampo">
          <P>
            O Uai Trampo é uma plataforma digital que busca conectar pessoas interessadas em realizar
            serviços e oportunidades de trabalho com pessoas ou empresas interessadas em contratar esses
            serviços.
          </P>
          <P>
            Para disponibilizar suas funcionalidades, a plataforma poderá coletar e tratar determinadas
            informações pessoais fornecidas pelos próprios usuários ou geradas durante a utilização do
            serviço.
          </P>
        </Section>

        <Section title="2. Dados pessoais coletados">
          <P>
            Dependendo das funcionalidades utilizadas, o Uai Trampo poderá coletar diferentes categorias de
            dados pessoais.
          </P>
          <P>Entre os dados que poderão ser solicitados estão:</P>
          <List
            items={[
              "Nome completo;",
              "Endereço de e-mail;",
              "Número de telefone;",
              "CPF;",
              "Data de nascimento, quando necessária;",
              "Endereço residencial;",
              "Rua;",
              "Número da residência;",
              "Bairro;",
              "Cidade;",
              "Informações relacionadas ao perfil profissional;",
              "Foto de perfil;",
              "Foto ou imagem de documentos de identificação, quando necessária para verificação;",
              "Informações relacionadas ao PIX, quando utilizadas para pagamentos;",
              "Informações de serviços realizados;",
              "Candidaturas a oportunidades;",
              "Avaliações e pontuações;",
              "Informações fornecidas em formulários de candidatura;",
              "Informações de comunicação entre usuários, quando disponibilizadas pela plataforma;",
              "Dados técnicos relacionados ao acesso e utilização da plataforma.",
            ]}
          />
          <P>
            O Uai Trampo buscará coletar apenas os dados necessários para as finalidades informadas e para
            o funcionamento adequado da plataforma.
          </P>
        </Section>

        <Section title="3. Como os dados são coletados">
          <P>Os dados pessoais poderão ser coletados quando o usuário:</P>
          <List
            items={[
              "Criar uma conta;",
              "Atualizar seu perfil;",
              "Candidatar-se a um serviço;",
              "Publicar uma oportunidade;",
              "Realizar ou aceitar uma contratação;",
              "Utilizar funcionalidades de pagamento;",
              "Enviar documentos para verificação;",
              "Entrar em contato com o suporte;",
              "Realizar avaliações;",
              "Utilizar outras funcionalidades disponibilizadas pela plataforma.",
            ]}
          />
          <P>
            Alguns dados também poderão ser gerados automaticamente durante a utilização do aplicativo,
            como informações técnicas necessárias para segurança, funcionamento e melhoria dos serviços.
          </P>
        </Section>

        <Section title="4. Finalidades do tratamento dos dados">
          <P>Os dados pessoais poderão ser utilizados para:</P>
          <List
            items={[
              "Criar e administrar contas de usuários;",
              "Permitir o funcionamento da plataforma;",
              "Facilitar a conexão entre trabalhadores e contratantes;",
              "Permitir candidaturas a serviços;",
              "Permitir a publicação de oportunidades;",
              "Realizar verificações de identidade e segurança;",
              "Processar ou facilitar pagamentos, quando essa funcionalidade estiver disponível;",
              "Permitir avaliações e sistemas de reputação;",
              "Prevenir fraudes e atividades ilegais;",
              "Proteger a segurança da plataforma;",
              "Melhorar a experiência dos usuários;",
              "Fornecer atendimento e suporte;",
              "Comunicar informações importantes sobre a conta e os serviços;",
              "Cumprir obrigações legais e regulatórias;",
              "Exercer direitos em processos judiciais, administrativos ou arbitrais;",
              "Cumprir outras finalidades legítimas relacionadas ao funcionamento da plataforma.",
            ]}
          />
        </Section>

        <Section title="5. Compartilhamento de dados">
          <P>
            O Uai Trampo poderá compartilhar dados pessoais quando necessário para o funcionamento da
            plataforma ou para cumprimento de obrigações legais.
          </P>
          <P>Os dados poderão ser compartilhados, quando aplicável, com:</P>
          <List
            items={[
              "Prestadores de serviços tecnológicos;",
              "Serviços de hospedagem e armazenamento de dados;",
              "Provedores de serviços de autenticação;",
              "Processadores e intermediadores de pagamento;",
              "Prestadores de serviços de segurança e prevenção a fraudes;",
              "Autoridades públicas, quando houver obrigação legal;",
              "Parceiros necessários para a prestação de determinados serviços da plataforma.",
            ]}
          />
          <P>
            O compartilhamento será realizado de acordo com as finalidades aplicáveis e, sempre que
            necessário, serão adotadas medidas para proteger os dados pessoais.
          </P>
        </Section>

        <Section title="6. Dados exibidos para outros usuários">
          <P>
            Para permitir o funcionamento do Uai Trampo, algumas informações do perfil poderão ser
            disponibilizadas para outros usuários da plataforma.
          </P>
          <P>Dependendo da funcionalidade utilizada, poderão ser exibidas informações como:</P>
          <List
            items={[
              "Nome;",
              "Foto de perfil;",
              "Informações profissionais;",
              "Avaliações;",
              "Pontuação;",
              "Nível de reputação;",
              "Informações relacionadas à experiência profissional;",
              "Outras informações que o usuário optar por disponibilizar em seu perfil.",
            ]}
          />
          <P>
            Dados pessoais sensíveis ou informações que não sejam necessárias para o funcionamento da
            plataforma não deverão ser publicados publicamente pelo usuário.
          </P>
        </Section>

        <Section title="7. Documentos de identificação">
          <P>
            Quando a plataforma solicitar documentos de identificação, como RG ou CNH, esses documentos
            poderão ser utilizados para fins de verificação de identidade e segurança.
          </P>
          <P>
            O acesso a esses documentos deverá ser restrito às finalidades necessárias para a operação da
            plataforma e segurança dos usuários.
          </P>
          <P>
            O Uai Trampo adotará medidas razoáveis para proteger esses documentos contra acesso não
            autorizado.
          </P>
        </Section>

        <Section title="8. Informações de pagamento e PIX">
          <P>
            Quando funcionalidades de pagamento estiverem disponíveis, o Uai Trampo poderá tratar
            informações necessárias para processar ou facilitar transações.
          </P>
          <P>
            As informações de pagamento poderão ser processadas por empresas especializadas em serviços
            financeiros e de pagamento.
          </P>
          <P>
            O Uai Trampo poderá utilizar informações relacionadas ao PIX para permitir pagamentos ou
            verificar a correspondência necessária para o funcionamento das funcionalidades da plataforma.
          </P>
          <P>
            Dados financeiros poderão ser tratados diretamente por provedores de pagamento, conforme suas
            próprias políticas de privacidade e termos de uso.
          </P>
        </Section>

        <Section title="9. Segurança dos dados">
          <P>
            O Uai Trampo busca adotar medidas técnicas e organizacionais razoáveis para proteger os dados
            pessoais contra:
          </P>
          <List
            items={[
              "Acessos não autorizados;",
              "Perda;",
              "Alteração indevida;",
              "Divulgação indevida;",
              "Destruição acidental ou ilícita.",
            ]}
          />
          <P>Apesar das medidas de segurança adotadas, nenhum sistema eletrônico pode garantir segurança absoluta.</P>
          <P>
            Em caso de incidente de segurança relevante que possa gerar risco ou dano aos titulares, serão
            adotadas as medidas cabíveis conforme a legislação aplicável.
          </P>
        </Section>

        <Section title="10. Armazenamento e retenção dos dados">
          <P>
            Os dados pessoais serão armazenados pelo período necessário para cumprir as finalidades
            descritas nesta Política de Privacidade.
          </P>
          <P>Alguns dados poderão ser mantidos por períodos adicionais quando necessário para:</P>
          <List
            items={[
              "Cumprimento de obrigações legais;",
              "Cumprimento de obrigações regulatórias;",
              "Exercício de direitos;",
              "Prevenção de fraudes;",
              "Resolução de disputas;",
              "Cumprimento de contratos.",
            ]}
          />
          <P>
            Após o término do período necessário, os dados poderão ser eliminados ou anonimizados, conforme
            permitido ou exigido pela legislação.
          </P>
        </Section>

        <Section title="11. Direitos dos titulares">
          <P>
            Nos termos da legislação aplicável, especialmente da LGPD, o usuário poderá exercer direitos
            relacionados aos seus dados pessoais, incluindo, quando aplicável:
          </P>
          <List
            items={[
              "Confirmação da existência de tratamento;",
              "Acesso aos dados pessoais;",
              "Correção de dados incompletos, inexatos ou desatualizados;",
              "Solicitação de anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;",
              "Portabilidade dos dados, quando aplicável;",
              "Informação sobre compartilhamentos;",
              "Revogação do consentimento, quando o tratamento estiver baseado nessa hipótese legal;",
              "Outros direitos previstos na legislação aplicável.",
            ]}
          />
          <P>As solicitações poderão ser analisadas de acordo com os requisitos e limitações previstos na legislação.</P>
        </Section>

        <Section title="12. Cookies e tecnologias semelhantes">
          <P>
            O Uai Trampo poderá utilizar cookies e tecnologias semelhantes para melhorar a experiência do
            usuário, manter sessões autenticadas, garantir segurança, analisar o funcionamento da
            plataforma e compreender como os serviços são utilizados.
          </P>
          <P>
            Quando aplicável, o usuário poderá controlar determinadas preferências relacionadas a cookies
            por meio das configurações disponíveis no aplicativo ou navegador.
          </P>
        </Section>

        <Section title="13. Comunicações">
          <P>
            O Uai Trampo poderá enviar comunicações relacionadas ao funcionamento da conta e dos serviços,
            incluindo:
          </P>
          <List
            items={[
              "Confirmações de cadastro;",
              "Alertas de segurança;",
              "Atualizações importantes;",
              "Informações sobre serviços;",
              "Notificações relacionadas a candidaturas;",
              "Informações sobre contratações;",
              "Comunicações de suporte.",
            ]}
          />
          <P>
            Comunicações promocionais, quando realizadas, poderão observar as preferências do usuário e a
            legislação aplicável.
          </P>
        </Section>

        <Section title="14. Privacidade de crianças e adolescentes">
          <P>O Uai Trampo não tem como objetivo coletar intencionalmente dados pessoais de crianças.</P>
          <P>
            Quando aplicável, o uso da plataforma por menores de idade deverá observar a legislação
            brasileira e as regras específicas relacionadas à proteção de crianças e adolescentes.
          </P>
          <P>
            Caso sejam identificados dados coletados indevidamente de crianças, o Uai Trampo poderá adotar
            as medidas cabíveis para sua exclusão, respeitando as obrigações legais aplicáveis.
          </P>
        </Section>

        <Section title="15. Serviços de terceiros">
          <P>O Uai Trampo poderá utilizar serviços fornecidos por terceiros para oferecer funcionalidades da plataforma.</P>
          <P>Esses terceiros poderão possuir suas próprias políticas de privacidade e regras de tratamento de dados.</P>
          <P>
            O usuário deverá consultar as políticas aplicáveis desses serviços quando utilizar
            funcionalidades que dependam de terceiros.
          </P>
        </Section>

        <Section title="16. Alterações da Política de Privacidade">
          <P>
            Esta Política de Privacidade poderá ser atualizada periodicamente para refletir mudanças na
            plataforma, nos serviços oferecidos ou na legislação aplicável.
          </P>
          <P>Quando houver alterações relevantes, o Uai Trampo poderá comunicar os usuários por meio dos canais disponíveis.</P>
          <P>A versão atualizada será disponibilizada dentro da plataforma.</P>
          <P>Quando necessário, os usuários poderão ser solicitados a confirmar novamente sua ciência ou aceitação da nova versão.</P>
        </Section>

        <Section title="17. Contato">
          <P>
            Caso o usuário tenha dúvidas sobre esta Política de Privacidade ou queira exercer seus direitos
            relacionados aos dados pessoais, poderá entrar em contato com o Uai Trampo por meio dos canais
            oficiais de atendimento disponibilizados na plataforma.
          </P>
        </Section>

        <Section title="18. Legislação aplicável">
          <P>
            Esta Política de Privacidade será interpretada de acordo com a legislação aplicável da
            República Federativa do Brasil, incluindo a Lei Geral de Proteção de Dados Pessoais — LGPD.
          </P>
        </Section>

        <div className="mt-10 border-t border-white/10 pt-5 text-center">
          <p className="text-sm font-semibold text-white">Uai Trampo</p>
          <p className="mt-1 text-xs text-white/60">Última atualização: 22 de julho de 2026</p>
        </div>
      </main>
    </div>
  );
};

export default PoliticaPrivacidade;
