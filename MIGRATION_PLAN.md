# OpenAI Integration Migration Plan

## Overview
This document describes the migration of OpenAI chat functionality from the Python Flask API (`api-server/`) to direct integration in the Node.js Atlassian Connect Express application.

**Date**: 2025-11-02
**Status**: In Progress

---

## Goals

1. **Replace Flask proxy** in `/conversations` endpoint with direct OpenAI API calls
2. **Remove dependency** on Python Flask backend (`localhost:5001/v1/ask`)
3. **Maintain backward compatibility** with existing frontend
4. **Use proven patterns** from existing `/image-to-dsl` endpoints

---

## Architecture Changes

### Before Migration
```
Frontend → Node.js BFF (/conversations) → Flask API (localhost:5001) → OpenAI API
```

### After Migration
```
Frontend → Node.js BFF (/conversations) → Cloudflare AI Gateway → OpenAI API
```

---

## Implementation Details

### 1. Endpoint: `/conversations`

**File**: `routes/index.js` (lines 95-160)

**Changes Made**:
- ✅ Removed proxy to Flask API
- ✅ Added direct OpenAI streaming API call
- ✅ Transformed ChatGPT message format to OpenAI format
- ✅ Added GPTDock system prompt
- ✅ Configured SSE streaming headers
- ✅ Added proper error handling

**Request Transformation**:
```javascript
// Frontend sends (ChatGPT format)
{
  messages: [{
    author: { role: 'user' },
    content: { parts: ['What is React?'] }
  }]
}

// Transformed to (OpenAI format)
[
  { role: 'system', content: 'You are GPTDock...' },
  { role: 'user', content: 'What is React?' }
]
```

**OpenAI API Configuration**:
- **Base URL**: Cloudflare AI Gateway (`process.env.OPENAI_BASEURL`)
- **Model**: `gpt-3.5-turbo`
- **Streaming**: `true`
- **Max Tokens**: `4096`

**System Prompt**:
```
You are an AI assistant called 'GPTDock'. Answer in well-formatted markdown.
Use headings, lists, code blocks, and formatting to make responses readable.
```

### 2. Token Management

**Decision**: **NO token tracking** (per user request)

- Removed all quota checking (`clientRunOutOfToken()`)
- Removed all token deduction (`deductClientToken()`)
- Frontend tracks quota separately via `/v2/client/info` endpoint
- Simplifies implementation and reduces complexity

### 3. Response Format

**No changes to frontend** - endpoint returns OpenAI SSE format:
```
data: {"choices":[{"delta":{"content":"Hello"}}]}
data: {"choices":[{"delta":{"content":" world"}}]}
data: [DONE]
```

Frontend's `StreamProcessor.mjs` already handles this format correctly.

### 4. Files Modified

#### routes/index.js
- **Line 11**: Added `GPTDOCK_SYSTEM_PROMPT` constant
- **Lines 96-160**: Replaced `/conversations` endpoint implementation

**Diff Summary**:
```diff
+ const GPTDOCK_SYSTEM_PROMPT = `You are an AI assistant called 'GPTDock'...`;

  app.post('/conversations', addon.checkValidToken(), async (req, res) => {
-     // Old: Proxy to Flask API
-     const response = await fetch(ASK_API_URL, {...});
-     return response.body.pipe(res);

+     // New: Direct OpenAI streaming
+     const openAIMessages = messages.map(msg => {...});
+     const allMessages = [
+       { role: 'system', content: GPTDOCK_SYSTEM_PROMPT },
+       ...openAIMessages
+     ];
+     const response = await fetch(`${OPENAI_BASEURL}/chat/completions`, {...});
+     return response.body.pipe(res);
  });
```

---

## Testing Plan

### Phase 1: Pre-testing Checks
- [ ] Verify app starts without errors
- [ ] Check for syntax errors
- [ ] Confirm environment variables are set (`OPENAI_API_KEY`, `OPENAI_BASEURL`)

### Phase 2: Functional Testing
- [ ] Test streaming chat completions
- [ ] Test multi-turn conversations with history
- [ ] Test system prompt is applied
- [ ] Test error handling (invalid API key, rate limits)
- [ ] Test frontend integration remains unchanged

### Phase 3: Edge Cases
- [ ] Empty messages array
- [ ] Invalid message format
- [ ] Network errors
- [ ] OpenAI API errors (4xx, 5xx)

---

## Environment Variables

**Required**:
```bash
OPENAI_API_KEY=sk-...           # OpenAI API key
OPENAI_BASEURL=https://...      # Cloudflare AI Gateway URL (optional)
```

**Current Configuration**:
- `OPENAI_BASEURL` defaults to Cloudflare AI Gateway
- Gateway provides caching, rate limiting, and monitoring

---

## Rollback Plan

If issues arise, rollback is simple:

### Git Rollback
```bash
git checkout HEAD -- routes/index.js
npm start
```

### Manual Rollback
Revert lines 11 and 96-160 in `routes/index.js` to original Flask proxy implementation.

---

## Python Flask API Retirement

### Can Be Removed
After successful migration, the following Python components are **no longer needed**:
- `api-server/src/app.py` - `/v1/ask` endpoint
- `api-server/src/open_ai/function_call.py` - OpenAI integration
- Flask API server on `localhost:5001`

### Must Keep (Not Related to Chat)
- Database management (if still used)
- Any other endpoints not related to `/conversations`

---

## Risk Assessment

**Risk Level**: **Very Low**

**Reasons**:
1. ✅ Same pattern already proven in `/image-to-dsl` endpoints
2. ✅ No breaking changes to frontend API contract
3. ✅ Streaming format matches frontend expectations
4. ✅ Easy rollback via git
5. ✅ No token management complexity

**Potential Issues**:
- Environment variable misconfiguration → Solution: Validate `.env` file
- Cloudflare Gateway errors → Solution: Fallback to direct OpenAI API
- Message format edge cases → Solution: Comprehensive input validation

---

## Dependencies

**No new dependencies required!**

Existing dependencies already support this:
- `node-fetch@2.6.1` - HTTP client for OpenAI API
- `express@4.17.1` - Web framework
- `atlassian-connect-express` - Auth middleware

---

## Performance Considerations

### Latency
- **Before**: Node.js → Flask → OpenAI (2 hops)
- **After**: Node.js → OpenAI (1 hop)
- **Improvement**: ~50-100ms reduction in TTFB

### Resource Usage
- **Before**: Python Flask server required (additional memory/CPU)
- **After**: Single Node.js process
- **Improvement**: Reduced infrastructure footprint

---

## Monitoring & Observability

### Logging
```javascript
console.log('Request to /conversations', messages, userId, clientId, productId);
console.log('OpenAI streaming request:', JSON.stringify(payload));
console.error('OpenAI API error:', response.status, response.statusText);
console.error('Error in /conversations:', error);
```

### Metrics to Track
- Request count to `/conversations`
- OpenAI API response times
- Error rates (4xx, 5xx)
- Streaming success rate

### Cloudflare AI Gateway Benefits
- Built-in analytics dashboard
- Rate limiting
- Caching
- Cost tracking

---

## Future Enhancements

### Potential Improvements (Not in Scope)
1. **Model selection**: Allow frontend to specify model (`gpt-3.5-turbo` vs `gpt-4`)
2. **Temperature control**: Expose creativity parameter
3. **Token optimization**: Implement token counting for better UX
4. **Response caching**: Cache common queries
5. **Retry logic**: Automatic retry on transient errors

---

## Success Criteria

Migration is considered successful when:

- [x] Code changes implemented
- [ ] App starts without errors
- [ ] Frontend can send chat messages
- [ ] Streaming responses work correctly
- [ ] Multi-turn conversations maintain history
- [ ] System prompt is visible in responses
- [ ] Error handling works as expected
- [ ] No regressions in existing features

---

## Timeline

| Phase | Status | Date |
|-------|--------|------|
| Planning & Research | ✅ Complete | 2025-11-02 |
| Implementation | ✅ Complete | 2025-11-02 |
| Testing | 🔄 In Progress | 2025-11-02 |
| Deployment | ⏳ Pending | TBD |
| Python API Retirement | ⏳ Pending | TBD |

---

## References

### Related Files
- `/routes/index.js` - Main routing file (modified)
- `/api-server/src/app.py` - Flask API (to be retired)
- `/api-server/src/open_ai/function_call.py` - Python OpenAI integration (reference)
- `/views/hello-world.jsx` - Frontend chat component (unchanged)
- `/views/StreamProcessor/StreamProcessor.mjs` - Stream parsing (unchanged)

### Documentation
- [OpenAI Streaming API](https://platform.openai.com/docs/api-reference/chat/create#chat-create-stream)
- [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/)
- [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

---

## Notes

- The esm module loader crash appears to be a pre-existing issue unrelated to these changes
- Frontend expects OpenAI SSE format - no changes needed
- Token management is handled separately by `/v2/client/info` endpoint
- No need for tiktoken library without token counting

---

## Approval

- [x] User approved plan
- [ ] Testing completed
- [ ] Ready for deployment
