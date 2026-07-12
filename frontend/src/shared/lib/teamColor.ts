// CSS variable with a team's brand color, defined in globals.css.
export function teamCssVar(teamId?: string) {
  if (!teamId) return undefined;
  return `var(--team-${teamId.toLowerCase().replace(" ", "_")})`;
}
