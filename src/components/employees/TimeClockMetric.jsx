import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentZambianDateString } from "../../utils/dateUtils";

export default function TimeClockMetric() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Harare",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date());
      setTime(now);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="hover:shadow-md transition-all duration-200 h-full relative overflow-hidden bg-gradient-to-br from-primary/5 to-background border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col h-full">
          <p className="text-sm text-muted-foreground mb-1 font-medium">Time Clock</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-foreground mb-1 font-mono tracking-tight">
              {time || "--:--:--"}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-auto">
            {getCurrentZambianDateString()}
          </p>
        </div>
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Clock size={20} />
        </div>
      </CardContent>
    </Card>
  );
}
