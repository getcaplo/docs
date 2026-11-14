---
title: Fast decisions
description: Turn on OpenAI-powered fast routing for your workspace, see what data it sends, and how agents with sub-agents use it.
sidebar:
  order: 3
---

Fast decisions let an agent that delegates to sub-agents pick the right sub-agent with one quick decision call, instead of extra rounds of model planning. A routing decision takes about 0.3 seconds instead of about 2 seconds, so customers wait less before the right specialist starts answering.

Fast decisions use the OpenAI Decisions API. Because that sends conversation content to OpenAI, it is off until an Owner or Admin accepts OpenAI's data processing terms for the workspace. After that, each agent still chooses whether to use it.

## What is sent to OpenAI

When an agent uses fast routing, each routing decision sends:

- the visitor's recent messages, and
- the descriptions of the agent's sub-agents (what each one is for, and when not to use it).

Agent instructions, tool results, memory and credentials are never sent.

Decisions are processed in the United States, the only region offered today. They run on Caplo's OpenAI account whatever your **OpenAI** key source is under **Integrations** then **Service providers**, and they appear on your bill as Caplo-managed usage.

## Turn on fast decisions

1. In the console, open **Settings** then **AI providers**.
2. In **Fast decisions**, check the **Provider** (OpenAI Decisions API) and **Processing region**.
3. Read the notice about what is sent, then select **I accept the OpenAI data processing terms for this workspace**. OpenAI becomes a subprocessor for routing decisions.
4. Select **Enable fast decisions**.

The panel then shows **Enabled**, the terms version you accepted and when the setting changed. The change is recorded in the workspace audit log.

Only Owners and Admins can turn fast decisions on or off. Other members see the setting read-only.

## Use fast routing in an agent

Turning on fast decisions does not change any agent by itself. For each agent that delegates to sub-agents:

1. Open the agent's sub-agent settings and, under **Routing**, choose **Fast routing** instead of **The model decides**.
2. Give every sub-agent link a **Do not use when** description. Fast routing can't be saved without one on each link.
3. Optionally, under **Advanced**, set **Minimum confidence** (0.60 to 0.99, default 0.85). Below it, the agent's model decides instead.
4. Publish a release and update the channels that should use it.

When a fast decision is not confident enough, or the decision call fails, the agent's model decides as it would without fast routing, so a conversation is never stuck on routing.

See [Sub-agents and routing](/agents/sub-agents-and-routing/) for how to write good sub-agent descriptions and test routing with evaluations.

## Turn fast decisions off

In **Settings** then **AI providers**, select **Disable fast decisions** and confirm. Agents set to fast routing fall back to model planning on their next turn, and no data is sent to OpenAI while it is off. Their routing setting is kept, so they use fast routing again if you turn it back on.
