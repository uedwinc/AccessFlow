#!/bin/bash
# Get the most recent log stream and its events
STREAM=$(aws logs describe-log-streams \
  --log-group-name /aws/lambda/accessflow-analyze \
  --order-by LastEventTime \
  --descending \
  --max-items 1 \
  --region us-east-1 \
  --query 'logStreams[0].logStreamName' \
  --output text)

echo "Stream: $STREAM"

aws logs get-log-events \
  --log-group-name /aws/lambda/accessflow-analyze \
  --log-stream-name "$STREAM" \
  --region us-east-1 \
  --query 'events[*].message' \
  --output text
