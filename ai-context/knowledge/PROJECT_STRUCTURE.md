# Project Folder and File Structure

This document captures the current workspace structure for project context.

## Workspace Root

```text
Musify/
├── LICENSE
├── package.json
├── README.md
├── ACE-Step/
│   ├── colab_inference.ipynb
│   ├── convert2hf_dataset.py
│   ├── docker-compose.yaml
│   ├── Dockerfile
│   ├── infer-api.py
│   ├── infer.py
│   ├── inference.ipynb
│   ├── LICENSE
│   ├── README.md
│   ├── requirements.txt
│   ├── setup.py
│   ├── TRAIN_INSTRUCTION.md
│   ├── trainer-api.py
│   ├── trainer.py
│   ├── ZH_RAP_LORA.md
│   ├── ace_step.egg-info/
│   ├── acestep/
│   │   ├── __init__.py
│   │   ├── apg_guidance.py
│   │   ├── cpu_offload.py
│   │   ├── data_sampler.py
│   │   ├── gui.py
│   │   ├── pipeline_ace_step.py
│   │   ├── text2music_dataset.py
│   │   ├── language_segmentation/
│   │   ├── models/
│   │   ├── music_dcae/
│   │   ├── schedulers/
│   │   └── ui/
│   ├── assets/
│   ├── build/
│   ├── config/
│   ├── data/
│   ├── examples/
│   └── zh_lora_dataset/
├── acestep/
│   ├── __init__.py
│   ├── apg_guidance.py
│   ├── cpu_offload.py
│   ├── data_sampler.py
│   ├── gui.py
│   ├── pipeline_ace_step.py
│   ├── text2music_dataset.py
│   ├── language_segmentation/
│   │   ├── __init__.py
│   │   ├── LangSegment.py
│   │   ├── language_filters.py
│   │   └── utils/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── ace_step_transformer.py
│   │   ├── attention.py
│   │   ├── config.json
│   │   ├── customer_attention_processor.py
│   │   └── lyrics_utils/
│   ├── music_dcae/
│   │   ├── __init__.py
│   │   ├── music_dcae_pipeline.py
│   │   ├── music_log_mel.py
│   │   └── music_vocoder.py
│   ├── schedulers/
│   │   ├── __init__.py
│   │   ├── scheduling_flow_match_euler_discrete.py
│   │   ├── scheduling_flow_match_heun_discrete.py
│   │   └── scheduling_flow_match_pingpong.py
│   └── ui/
│       ├── __init__.py
│       └── components.py
├── backend/
│   ├── main.py
│   ├── prompts.py
│   └── requirements.txt
├── docs/
│   └── notes.md
├── frontend/
│   ├── components.json
│   ├── eslint.config.js
│   ├── next-env.d.ts
│   ├── next.config.js
│   ├── package.json
│   ├── postcss.config.js
│   ├── prettier.config.js
│   ├── README.md
│   ├── start-database.sh
│   ├── tsconfig.json
│   ├── generated/
│   │   └── prisma/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── public/
│   └── src/
│       ├── env.js
│       ├── app/
│       ├── components/
│       ├── hooks/
│       ├── inngest/
│       ├── lib/
│       ├── server/
│       ├── styles/
│       └── trpc/
└── ai-context/
    ├── FOLDER_STRUCTURE.md
    ├── prompts/
    ├── instructions/
    ├── knowledge/
    ├── sessions/
    ├── outputs/
    └── experiments/
```

## Notes

- This tree is based on the current workspace view and may omit ignored/generated internals.
- Use this file as the baseline context map for AI-assisted tasks.
