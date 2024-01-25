import { LinearClient } from "@linear/sdk";
import { loadFront } from "yaml-front-matter";

// eslint-disable-next-line node/no-missing-import
import { IssueCreateInput } from "@linear/sdk/dist/_generated_documents";
import { isString } from "util";

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
    private apiKey: string,
    private teamId: string,
    private stateId: string,
    public isDryrun: boolean = false
  ) {
    this.client = new LinearClient({ apiKey });
  }

  /**
   * create task for check renovate.
   */
  async createIssue(issueData?: IssueData) {
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
    return this.client.issueCreate(issueCreateInput);
  }

  private resolveFormatString = (
    formatString: string,
    replaces: Record<string, unknown>
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
    replaces?: Record<string, unknown>
  ): IssueData {
    const front = loadFront(data);
    const { __content, title, description, ...other } = front;

    const replacedOther: { [key: string]: any } = other;
    let replacedTitle = title;

    if (replaces !== undefined) {
      replacedTitle = this.resolveFormatString(title, replaces);

      for (const key of Object.keys(other)) {
        if (typeof other[key] === "string")
          replacedOther[key] = this.resolveFormatString(other[key], replaces);
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
