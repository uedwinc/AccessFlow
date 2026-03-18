aws logs get-log-events \
  --log-group-name /aws/lambda/accessflow-analyze \
  --log-stream-name '2026/03/18/[$LATEST]899fbb8fd4fc4611a0452f2a4c5d8aee' \
  --region us-east-1 \
  --query 'events[*].message' \
  --output text
