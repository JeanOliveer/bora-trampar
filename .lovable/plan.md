# Plano: Fluxo Completo de Contratação UaiTrampo

Escopo grande envolvendo schema, storage, frontend (Empresa + Trabalhador) e câmera. Vou implementar em 4 blocos, mantendo o design atual (mesmo padrão do painel Início) e responsividade mobile-first.

---

## 1. Banco de dados (migrations)

**Nova tabela `servico_perguntas`** — perguntas customizadas por serviço:
- `servico_id`, `ordem`, `texto`, `tipo` (`texto_curto` | `texto_longo` | `multipla_escolha`), `opcoes` (jsonb), `obrigatoria`
- RLS: admin gerencia; qualquer autenticado lê quando o serviço está ativo.

**Nova tabela `candidatura_respostas`** — respostas do candidato:
- `candidatura_id`, `pergunta_id`, `resposta`
- RLS: candidato cria/lê as próprias; admin lê todas.

**Alterações em `candidaturas`**:
- `selfie_url text` (obrigatório no insert via check de aplicação)
- `documento_rg_url text` (já existe `documento_url` — vou reaproveitar como RG e adicionar `selfie_url`)
- Novo status `chegada_confirmada` no fluxo (campo `chegada_confirmada_em timestamptz`)

**Storage**:
- Bucket existente `documentos-candidatura` (privado) — usar para RG + selfie. Políticas: usuário faz upload na própria pasta `{auth.uid()}/...`; admin lê tudo.

---

## 2. Painel Empresa (Admin)

**`NovoServico.tsx` / `Admin.tsx` (editar serviço)**:
- Nova seção "Perguntas para candidatos" com:
  - Lista de perguntas adicionadas (edit/delete antes de publicar/salvar)
  - Form para adicionar pergunta: texto, tipo (select), opções (quando múltipla escolha), obrigatória (switch)
- Salvar perguntas junto com o serviço.

**`AdminCandidatoPerfil.tsx`** (detalhes do candidato):
- Mostrar respostas das perguntas customizadas
- Mostrar RG e selfie (imagens com signed URL)
- Mostrar **fluxo visual de progresso** horizontal (4 etapas: Aprovado → Presença Confirmada → Chegada Confirmada → Concluído) com ícones e cores
- Botão **"Confirmar Chegada"** habilitado somente após `presenca_confirmada_em`. Ao clicar: grava `chegada_confirmada_em = now()`, status `chegada_confirmada`, exibe badge verde.

---

## 3. Painel Trabalhador

**`Servicos.tsx`**:
- Adicionar Tabs no topo: "Disponíveis" | "Aprovados"
- Aba "Aprovados": lista candidaturas com status `aprovada` ou superior, mostrando empresa, título, data/hora, local, status atual, e botão **"Confirmar Presença"** (quando ainda não confirmada).

**`CandidaturaDialog.tsx`** (formulário de candidatura):
- Listar perguntas do serviço; validar obrigatórias.
- Upload de RG (input file) **obrigatório**.
- **Selfie ao vivo**: botão abre `<video>` com `getUserMedia({ video: { facingMode: 'user' } })`, captura para canvas → blob → upload. Obrigatório.
- Bloquear submit sem ambos.
- Salvar respostas em `candidatura_respostas` após criar candidatura.

---

## 4. Notificações / UX

- Toasts (sonner) já existem — disparar em cada mudança de status (cliente).
- Badges coloridos de status em todos os cards (helper `statusBadge(status)`).
- Componente reutilizável `ProgressoServico` com 4 etapas, usado em Admin e Trabalhador.
- Realtime: subscribe em `candidaturas` filtrando por `user_id` (trabalhador) para refletir confirmações da empresa em tempo real.

---

## Detalhes técnicos

- **Câmera**: `navigator.mediaDevices.getUserMedia` — requer HTTPS (preview já é). Fallback: input `capture="user"` em browsers sem suporte.
- **Upload**: `supabase.storage.from('documentos-candidatura').upload(\`${user.id}/selfie-${candId}.jpg\`, blob)` → salvar path; gerar signed URL ao exibir.
- **Tipos**: regenerados pelo Supabase após migration.
- **Design**: reaproveitar tokens (`bg-card`, `text-primary`, `shadow-[var(--shadow-card)]`, `rounded-2xl`) já usados no Início.
- **Mobile**: tudo testado a 390px; Tabs e fluxo de progresso em layout horizontal scrollável quando necessário.

---

## Ordem de execução

1. Migration (tabelas + storage policies) — aguarda aprovação.
2. Componente `ProgressoServico` + helper de status.
3. Empresa: editor de perguntas no `NovoServico` / `Admin`.
4. Trabalhador: tabs em `Serviços` + aba Aprovados + botão Confirmar Presença.
5. `CandidaturaDialog`: perguntas dinâmicas + RG + selfie.
6. `AdminCandidatoPerfil`: respostas, imagens, botão Confirmar Chegada, fluxo visual.
7. Realtime + toasts de mudança de status.

Posso prosseguir com a migration?