---
title: Knowledge
description: How knowledge bases, documents, review, versions and audiences work, and how agents use them to answer.
sidebar:
  order: 5
---

A **knowledge base** is a set of documents your agents can search to answer questions, such as product guides, policies or FAQs. An agent with knowledge looks up relevant passages while it answers, instead of relying on what its model already knows.

Knowledge bases belong to the workspace, not to one agent. You manage them under **Knowledge** in the console, and any number of agents can attach the same base.

## Documents and review

You add documents to a knowledge base as files: PDF, DOCX, HTML, Markdown, plain text, and PNG, JPG or WebP images, up to 25 MB each. Each file goes through the same steps before agents can use it:

1. **Extract.** Caplo extracts the text, including text in images and the page layout.
2. **Review.** You check the extracted text and the passages (chunks) agents will retrieve. Look for missing pages, broken tables, unreadable images and anything sensitive that should not be there.
3. **Approve.** An Owner or Admin approves the document.

Builders can create knowledge bases and upload files, but only Owners and Admins approve documents and publish versions. This keeps a person accountable for what agents tell customers.

## Versions

Approved documents become available to agents only when an Owner or Admin publishes a **version** of the knowledge base. Caplo indexes the version, and once it is ready agents can search it. Versions are immutable: files you add or change later stay in the draft until you review them and publish another version.

When you publish an agent, its release pins the knowledge version that was current at that moment. A new knowledge version does not change live answers until you publish the agent again. This means you can review exactly what a release knows, and an upload can never silently change what customers are told. See [Agents and releases](/concepts/agents-and-releases/).

## Audience

Each knowledge base has an **Audience**:

| Audience | Who it serves |
| --- | --- |
| **Public** | Anyone talking to the agent. |
| **Verified customers only** | Only customers who have signed in during the conversation, on a channel that allows customer sign-in. Use it for content that should not reach anonymous visitors, such as account-specific procedures. |

A change of audience applies from the next published version.

## Keeping knowledge in sync

To keep a knowledge base in step with a folder of files in your repository, use `caplo knowledge sync`. It uploads new and changed files, removes ones that are gone, and with `--approve` and `--publish` approves them and publishes a version in one step. Approving this way skips reviewing the extracted text, so use it for content you already trust.

## Related

- [Give an agent knowledge](/agents/knowledge/)
- [Evaluations](/concepts/evaluations/): add eval cases that check answers drawn from your documents.
- [`caplo knowledge sync`](/reference/cli/knowledge/#caplo-knowledge-sync)
