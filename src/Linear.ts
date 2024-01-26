import { LinearClient } from "@linear/sdk";
import { loadFront } from "yaml-front-matter";

// eslint-disable-next-line node/no-missing-import,import/no-unresolved
import { IssueCreateInput } from "@linear/sdk/dist/_generated_documents";

export class UndefinedError extends Error {
  constructor(content: string) {
    super();
    this.name = "UndefinedError";
    this.message = `${content} is undefined`;
  }
}

type IssueData = { [key: string]: unknown; title: string };

export class Linear {
  private client: LinearClient;
  private issueData?: IssueData;

  constructor(
    apiKey: string,
    private teamId: string,
    private stateId: string,
    public isDryrun: boolean = false,
    client: LinearClient | undefined = undefined,
  ) {
    this.client = client ?? new LinearClient({ apiKey });
  }

  async createIssue(issueData?: IssueData): Promise<string | IssueCreateInput> {
    let inputIssueData = issueData;
    if (inputIssueData === undefined) {
      inputIssueData = this.issueData;
    }

    if (inputIssueData === undefined) {
      throw new UndefinedError("IssueData");
    }

    const issueCreateInput: IssueCreateInput = {
      teamId: this.teamId,
      stateId: this.stateId,
      ...inputIssueData,
    };

    if (this.isDryrun) {
      return issueCreateInput;
    }

    const result = await this.client.createIssue(issueCreateInput);
    const createdIssue = await result.issue;

    if (!createdIssue) {
      throw new Error("Could not retrieve created issue");
    }

    return createdIssue?.identifier;
  }

  private resolveFormatString = (
    formatString: string,
    replaces: Record<string, unknown>,
  ) => {
    let resultString = formatString;
    for (const [key, value] of Object.entries(replaces)) {
      if (typeof value === "string" && formatString.includes(`\${${key}}`)) {
        const replace = `\\\${${key}}`;
        const regexp = new RegExp(replace, "g");
        resultString = resultString.replace(regexp, value);
      }
    }
    return resultString;
  };

  readData(
    data: string | Buffer,
    replaces?: Record<string, unknown>,
  ): IssueData {
    const front = loadFront(data);
    const { __content, title, description, ...other } = front;

    const replacedOther: { [key: string]: any } = other;
    let replacedTitle = title;

    if (replaces !== undefined) {
      replacedTitle = this.resolveFormatString(title, replaces);

      for (const key of Object.keys(other)) {
        if (typeof other[key] === "string") {
          replacedOther[key] = this.resolveFormatString(other[key], replaces);
        }

        if (key === "labelIds" && replacedOther[key].includes(",")) {
          replacedOther[key] = replacedOther[key]
            .split(",")
            .map(String)
            .filter((x: string) => !!x)
            .map((x: string) => x.trim());
        }
      }
    }

    this.issueData = {
      title: replacedTitle,
      description: __content,
      ...replacedOther,
    };

    return this.issueData;
  }
}
