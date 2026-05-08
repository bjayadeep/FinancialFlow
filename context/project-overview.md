# FinanceFlow

## Overview

FinanceFlow is an AI-powered personal finance tracker built for individuals who want intelligent insights into their spending. It lets users import bank transactions, set budget goals, and interact with an AI assistant that can answer natural language questions about their finances, auto-categorize transactions, detect anomalies, and suggest budget improvements.

## Goals

1. Ship a production-ready full-stack portfolio project using React + Node/Express + Claude API
2. Demonstrate real AI agent usage (tool use, streaming, structured outputs) — not just a chatbot wrapper
3. Build a SaaS-quality UI that looks professional enough to show recruiters

## Core User Flow

1. User registers / logs in via auth screen
2. User lands on Dashboard — sees spending overview, charts, budget progress
3. User imports transactions via CSV or adds them manually
4. AI agent auto-categorizes each transaction
5. User sets monthly budget goals per category
6. AI Budget Advisor analyses patterns and suggests adjustments
7. Anomaly Detector flags unusual transactions with explanations
8. User chats with AI Assistant using natural language ("How much did I spend on food last month?")

## Features

### Transaction Management
- Manual transaction entry (amount, description, date, category, account)
- CSV import with intelligent column mapping agent
- Category badges, filters, search, pagination
- Edit and delete transactions

### Budget Goals
- Create monthly budget limits per category
- Progress bars with color indicators (green / yellow / red)
- AI budget suggestions based on spending patterns

### AI Agents
- **Transaction Categorizer** — auto-tags imported transactions via Claude
- **CSV Import Agent** — maps messy bank export columns intelligently
- **Budget Advisor Agent** — analyses patterns, suggests adjustments
- **Anomaly Detector** — flags unusual spending with natural language explanation
- **Chat Assistant** — natural language queries over the user's own financial data

### Dashboard & Reporting
- Stat cards: Total Balance, Monthly Income, Monthly Expenses, Savings Rate
- Line chart: Income vs Expenses over 6 months
- Donut chart: Spending by category
- Recent transactions list

### Alerts
- AI-generated anomaly alerts with severity levels
- Mark Safe / Investigate / Dismiss actions
- Configurable alert preferences

## Scope

### In Scope
- Full authentication (register, login, JWT)
- All 6 UI screens (Dashboard, Transactions, Budgets, AI Assistant, Alerts, Auth)
- All 5 Claude AI agents
- PostgreSQL database via Prisma
- CSV file import
- Streaming AI responses via Vercel AI SDK

### Out of Scope
- Bank API / Plaid integration (manual + CSV only for now)
- Mobile app
- Multi-currency support
- Team / shared accounts

## Success Criteria

1. A logged-in user can import a CSV and see transactions auto-categorized by AI
2. The chat assistant correctly answers "How much did I spend on food last month?"
3. The anomaly detector flags a transaction that is 3x higher than the user's average in that category
4. All pages load without errors and the sidebar stays fixed on scroll
5. The app is deployed and accessible via a public URL
