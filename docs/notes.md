# Musify Development Notes

## Refactoring Ideas

### Break Up Prompt Formatting and Music Generation into Separate FastAPI Calls

**Status:** Planned

**Context:**
Currently, the `generateAndPostToS3` endpoint handles everything in a single call:
1. Format prompt using LLM
2. Format lyrics using LLM
3. Generate categories from prompt
4. Generate music
5. Generate image
6. Upload to S3
7. Return response

**Proposed Refactoring:**
Split this into multiple sequential FastAPI endpoints that can be called separately, allowing:
- Better job tracking and status updates
- Ability to update job status after each step
- More granular error handling
- Better integration with Inngest events
- Easier to debug individual steps

**Proposed Endpoints:**
1. `POST /format-prompt` - Takes user prompt, returns formatted prompt
2. `POST /format-lyrics` - Takes lyrics, returns formatted lyrics  
3. `POST /generate-categories` - Takes prompt, returns category list
4. `POST /generate-music` - Takes formatted prompt/lyrics, returns audio file
5. `POST /generate-image` - Takes prompt, returns image file
6. `POST /upload-to-s3` - Takes local files, uploads to S3, returns paths
7. `POST /generate-full` - Orchestrates all above steps (or keep as legacy endpoint)

**Benefits:**
- Can update database job status between steps
- Better error recovery (don't lose progress if one step fails)
- Easier to cache intermediate results
- Cleaner separation of concerns
- Better for async processing with Inngest

**Implementation Notes:**
- Consider passing job/song ID through each step for tracking
- Store intermediate results in database or temporary storage
- Update `SongStatus` enum as needed for step-specific statuses
- May need a temporary storage strategy for intermediate files

**Related Files:**
- `/backend/main.py` - MusicModelServer class
- `/frontend/src/inngest/functions.ts` - Inngest orchestration
- `/frontend/prisma/schema.prisma` - Song model

---

## Completed Tasks

- ✅ Added Prisma enum for SongStatus (QUEUED, IN_PROGRESS, COMPLETED, FAILED)
- ✅ Created GenerationParams interface in frontend/lib
- ✅ Setup S3 integration with boto3

## In Progress

- Modal FastAPI endpoint refinement
- Inngest event handling

## Backlog

- [ ] Implement separated FastAPI endpoints for granular processing
- [ ] Add real-time status updates via WebSockets or polling
- [ ] Implement retry logic for failed generation steps
- [ ] Add user credits/quota system
- [ ] Setup monitoring and logging dashboard
