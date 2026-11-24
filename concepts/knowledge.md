# Knowledge

> How knowledge bases, live files and audiences work, and how agents use them to answer.

A **knowledge base** is a set of files your agents can search to answer questions, such as product guides, policies, price lists or FAQs. An agent with knowledge looks up relevant passages while it answers, instead of relying on what its model already knows.

Knowledge bases belong to the workspace, not to one agent. You manage them under **Knowledge** in the console, and any number of agents can attach the same base.

## Files

You add files to a knowledge base: PDF, DOCX, HTML, Markdown, plain text, and PNG, JPG or WebP images, up to 25 MB each. Caplo reads each file, including text in images and the page layout, cuts it into passages and indexes them. The file then goes **Live** by itself, and agents find it from the next question on.

Owners, Admins and Builders manage files. They can read the text agents get from each file, try a customer’s question to see which passages it finds, and:

* **Replace** a file. Its current content keeps answering until the new content is live, and stays live if the new content cannot be read.
* **Unpublish** a file to take it out of answers at once while keeping it stored, and **Publish** it again later.
* **Delete** a file, which agents stop finding at once.

## Knowledge is live

Knowledge is not pinned to an agent release. A release records which knowledge bases the agent uses, with their names and descriptions, and every search reads the bases’ live, published files. Uploading, replacing, unpublishing or deleting a file changes answers in every agent that uses the base, without publishing the agent again. A new name or description reaches the agent when it is published again. See [Agents and releases](/concepts/agents-and-releases/).

## Audience

Each knowledge base has an **Audience**:

| Audience                    | Who it serves                                                                                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Public**                  | Anyone talking to the agent.                                                                                                                                                                            |
| **Verified customers only** | Only customers who have signed in during the conversation, on a channel that allows customer sign-in. Use it for content that should not reach anonymous visitors, such as account-specific procedures. |

A change of audience applies from the next search.

## Keeping knowledge in sync

To keep a knowledge base in step with a folder of files in your repository, use `caplo knowledge sync`. It uploads new files, replaces changed ones and deletes the ones that are gone, so a CI job can keep agents answering from the files your team maintains.

## Related

* [Add knowledge](/agents/knowledge/)
* [Evaluations](/concepts/evaluations/): add eval cases that check answers drawn from your files.
* [`caplo knowledge sync`](/reference/cli/knowledge/#caplo-knowledge-sync)
