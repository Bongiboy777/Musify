import { fetchRun, getRun } from "@/lib/actions/jobs";
import { NextResponse } from "next/server";

async function POST(request: Request){
    const {eventId} = await request.json()
    const runData = await getRun(eventId)
    return NextResponse.json({
        body: runData,
        success: true,
        status: 200
    }, )
}

export {POST}