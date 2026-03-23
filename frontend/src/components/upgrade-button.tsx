import React from "react";
import { Button } from "./ui/button";

const UpgradeButton = () => {
  return (
    <Button
      className="flex-1 self-center cursor-pointer border bg-transparent font-bold tracking-wide text-orange-400 hover:bg-orange-400 hover:text-white"
      variant={"outline"}
    >
      Upgrade
    </Button>
  );
};

export default UpgradeButton;
