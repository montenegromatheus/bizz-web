import { WorkWeek } from "@/schema";

export interface UpdateWorkWeeksDto {
  workWeeks?: Partial<WorkWeek>[];
}
