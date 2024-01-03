import { Action } from "./Action";
import { Save } from "./actions/Save";
import { Reroll } from "./actions/Reroll";
import { Expand } from "./actions/Expand";

export const Actions: Action[] = [Save, Reroll, Expand];

export function defaultActions(count: number) {
  return [Reroll, Save];
}
