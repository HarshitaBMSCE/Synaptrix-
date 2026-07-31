export const rightsPack = [
  {
    theme: "Payment transparency",
    jurisdiction: "India / Karnataka general worker-rights context",
    snippet:
      "Workers should receive clear information about how pay is computed, including base pay, distance, incentives, fees, and deductions where the platform makes those details available."
  },
  {
    theme: "Clear deductions",
    jurisdiction: "India / Karnataka general worker-rights context",
    snippet:
      "Unexplained or surprising deductions should be queried with job identifiers, date, payout screenshots, and a request for the calculation basis."
  },
  {
    theme: "Contract clarity",
    jurisdiction: "India / Karnataka general worker-rights context",
    snippet:
      "Terms that affect payout, penalties, access to work, or service expectations should be accessible in a clear language the worker can understand."
  },
  {
    theme: "Right to refuse tasks",
    jurisdiction: "India / Karnataka general worker-rights context",
    snippet:
      "Gig workers should understand when refusing a task may affect ratings, incentives, or access, and ask platforms to explain automated consequences."
  },
  {
    theme: "Automated-decision transparency",
    jurisdiction: "India / Karnataka general worker-rights context",
    snippet:
      "When an app decision affects pay, task access, or account status, workers can ask what information was used and how to request review."
  },
  {
    theme: "Notice and deactivation",
    jurisdiction: "India / Karnataka general worker-rights context",
    snippet:
      "For deactivation or termination, workers should request written reasons, timeline, evidence, and an appeal or grievance path."
  },
  {
    theme: "Safe working conditions",
    jurisdiction: "India / Karnataka general worker-rights context",
    snippet:
      "Workers can report unsafe pickup or drop points, severe weather risk, harassment, and road hazards, and should avoid treating a route score as a guarantee."
  },
  {
    theme: "Rest and fatigue",
    jurisdiction: "India / Karnataka general worker-rights context",
    snippet:
      "Long continuous hours can increase fatigue risk. Break reminders are product guidance and not a medical diagnosis."
  },
  {
    theme: "Multilingual communication",
    jurisdiction: "India / Karnataka general worker-rights context",
    snippet:
      "Workers should be able to request key payment and grievance information in a language they understand."
  },
  {
    theme: "Grievance redressal",
    jurisdiction: "India / Karnataka general worker-rights context",
    snippet:
      "A complaint should include facts, dates, job identifiers, screenshots, requested remedy, and a clear response deadline."
  }
];

export function getRightsSnippet(theme: string) {
  return rightsPack.find((entry) => entry.theme.toLowerCase().includes(theme.toLowerCase())) ?? rightsPack[0];
}
