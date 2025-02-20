#!/bin/sh

trivy=$(trivy fs --scanners secret -q --skip-dirs frontend/node_modules,frontend/coverage,frontend/html,frontend/test-results,backend/.idea,backend/.gradle,backend/.build -f json .)
errors=$(echo $trivy | jq '.Results | length')

if [ $errors -eq "0" ] ; then
    exit 0
fi
echo $trivy | jq
exit 1
