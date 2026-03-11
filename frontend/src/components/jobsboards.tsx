import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import { cuid, guid } from "zod";

const fetchJob = async (jobId: string) => {
        const runData = await fetch("api/job", {
          method: "POST",
          body: JSON.stringify({
            eventId: jobId,
          }),
        });
        return await runData.json();
      }

const JobsBoard = ({ jobs }: { jobs: string[] }) => {
  const [jobData, setJobData] = useState<any[]>([]);
  const [timers, setTimers] = useState<any[]>([]);
  
  const fetchJobs = async () => {
    const newJobData = await Promise.all(
      jobs.map(async jobId => await fetchJob(jobId)),
    );
    setJobData(newJobData);
  };

  
  useEffect(() => {
    if (jobs && jobs.length > 0) fetchJobs();
    
  }, [jobs]);

    useEffect(() => {
        if (!jobs || jobs.length === 0) return;

        const ids = jobs.map((jobId, idx) =>
            setInterval(async () => {
                const updated = await fetchJob(jobId);
                setJobData(prev => {
                    const next = [...prev];
                    next[idx] = updated;
                    return next;
                });
            }, 5000)
        );

        return () => ids.forEach(clearInterval);
    }, [jobs]);


  return (
    <div className="p-4">
      <h4 className="mb-4 text-sm leading-none font-medium">Jobs</h4>
      {jobData.map((job) => (
        <React.Fragment key={Math.random()}>
          <div className="text-sm">{job.body.status.status}</div>
          <Separator className="my-2" />
        </React.Fragment>
      ))}
    </div>
  );
};

export default JobsBoard;
