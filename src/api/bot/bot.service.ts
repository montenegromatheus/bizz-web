import { BotParameters } from "@/schema";
import { axios } from "../axios";
import { UpdateBotParametersDto } from "./bot.dto";

export async function findOne(id: string): Promise<BotParameters> {
  return await axios.get(`bot/${id}`);
}

export async function update(
  id: string,
  data: UpdateBotParametersDto,
): Promise<BotParameters> {
  return await axios.put(`bot/${id}`, data);
}
