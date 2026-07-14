# Requirements — 001 Connect harness-sdlc

## Feature

Connect the TimeEstimator repository to the harness-sdlc operating model.

## Mode

MVP

## Status

review

## Problem

TimeEstimator has a useful product concept and working application structure, but it lacks a repo-level agentic SDLC control system. Without a harness, future AI-assisted changes can drift into visual tweaks, broken deployment changes, or unverified formula modifications.

## Goals

- Add repository-level operating instructions for AI agents.
- Add a feature registry with lifecycle status.
- Define source-of-truth files for future work.
- Capture the cinematic frontend rebuild as a reviewable SHIP-mode spec before implementation.
- Record initial technical findings without modifying application code.

## Non-goals

- Do not redesign the frontend in this feature.
- Do not change estimation formulas.
- Do not install packages.
- Do not change deployment behavior.
- Do not update production app code.

## Acceptance criteria

- `AGENTS.md` exists and points agents to `RTK.md`.
- `RTK.md` describes TimeEstimator-specific workflow, lifecycle, file boundaries, frontend POV, and verification expectations.
- `CLAUDE.md` exists for Claude-oriented agent routing.
- `feature_list.json` defines allowed statuses and a sequenced feature backlog.
- `progress/current.md` and `progress/history.md` exist.
- `specs/001-connect-harness-sdlc/*` documents this bootstrap step.
- `specs/002-cinematic-frontend-command-center/*` defines the next frontend feature without implementing it.

## Verification

Markdown/filesystem verification only for this feature. App build verification is not required because app code is not touched.
