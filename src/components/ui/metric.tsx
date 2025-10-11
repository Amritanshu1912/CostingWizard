// better custom card.

import { TrendingUp, Icon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./card";

<Card key={card.title} className="card-enhanced flex flex-row ">
  <div className="flex-1">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {card.title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col gap-2">
        <div className="text-3xl font-bold text-foreground">{card.value}</div>
        <div className="flex items-center space-x-1 text-xs">
          <TrendingUp className="h-3 w-3 text-green-600" />
          <span className="text-green-600">{card.change}</span>
          <span className="text-muted-foreground">{card.changeText}</span>
        </div>
      </div>
    </CardContent>
  </div>
  <div className="flex items-center justify-centerw-[76px] h-[76px] px-6">
    <Icon className="h-12 w-12 text-primary" />
  </div>
</Card>;
