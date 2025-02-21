#!/bin/sh

trivy fs --scanners secret -q --exit-code 1 --skip-dirs frontend/node_modules,frontend/coverage,frontend/html,frontend/test-results,backend/.idea,backend/.gradle,backend/.build .
