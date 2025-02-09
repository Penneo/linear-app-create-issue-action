// eslint-disable-next-line node/no-unpublished-import
import nock from "nock";
import { Linear } from "../Linear";
import { readFileSync } from "fs";

const basePath = "https://api.linear.app";
const endpoint = "/graphql";

describe(Linear, () => {
  let linear: Linear;

  beforeEach(() => {
    linear = new Linear("apiKey", "teamId", "stateId");
    nock.cleanAll();
  });

  describe("#createIssue", () => {
    test("create issue from input", async () => {
      nock(basePath)
        .post(endpoint, {
          query: /.+/,
          variables: {
            input: {
              teamId: "teamId",
              stateId: "stateId",
              title: "This is title",
              description: "hoge",
            },
          },
        })
        .reply(200, {
          data: {
            issueCreate: {
              success: true,
              issue: {
                id: "107823cc-xxxx-xxxx-xxxx-b4cfdb9a03b7",
                title: "This is title",
                identifier: "LIN-111",
              },
            },
          },
        });

      nock(basePath)
        .post(endpoint, {
          query: /.+/,
          variables: {
            id: "107823cc-xxxx-xxxx-xxxx-b4cfdb9a03b7",
          },
        })
        .reply(200, {
          data: {
            issue: {
              identifier: "LIN-111",
            },
          },
        });

      const actual = await linear.createIssue({
        title: "This is title",
        description: "hoge",
      });

      expect(actual).toEqual("LIN-111");
    });

    test("create issue from markdown", async () => {
      nock(basePath)
        .post(endpoint, {
          query: /.+/,
          variables: {
            input: {
              teamId: "teamId",
              stateId: "stateId",
              title: "test issue",
              estimate: 1,
              description:
                "\n\n## Items\n* Item 1\n* Item 2\n* Item 3\n\n## CheckBoxes\n- [ ] CheckBox 1\n- [ ] CheckBox 2\n\n*created by [hoge](https://github.com)*\n",
            },
          },
        })
        .reply(200, {
          data: {
            issueCreate: {
              success: true,
              issue: {
                id: "107823cc-xxxx-xxxx-xxxx-b4cfdb9a03b7",
                title: "test issue",
                estimate: 1,
                description:
                  "\n\n## Items\n* Item 1\n* Item 2\n* Item 3\n\n## CheckBoxes\n- [ ] CheckBox 1\n- [ ] CheckBox 2\n\n*created by [hoge](https://github.com)*\n",
              },
            },
          },
        });

      nock(basePath)
        .post(endpoint, {
          query: /.+/,
          variables: {
            id: "107823cc-xxxx-xxxx-xxxx-b4cfdb9a03b7",
          },
        })
        .reply(200, {
          data: {
            issue: {
              identifier: "LIN-222",
            },
          },
        });

      const data = readFileSync("./src/__tests__/test.md");
      const issueData = linear.readData(data);
      expect(issueData).toEqual({
        title: "test issue",
        estimate: 1,
        description:
          "\n\n## Items\n* Item 1\n* Item 2\n* Item 3\n\n## CheckBoxes\n- [ ] CheckBox 1\n- [ ] CheckBox 2\n\n*created by [hoge](https://github.com)*\n",
      });

      const actual = await linear.createIssue();
      expect(actual).toEqual("LIN-222");
    });

    test("create issue with dryrun", async () => {
      linear.isDryrun = true;

      const actual = await linear.createIssue({
        title: "This is title",
        description: "hoge",
      });

      expect(actual).toEqual({
        title: "This is title",
        description: "hoge",
        teamId: "teamId",
        stateId: "stateId",
      });
    });

    test("create issue with replace", async () => {
      linear.isDryrun = true;

      const data = readFileSync("./src/__tests__/test_with_replace.md");
      const issueData = linear.readData(data, {
        month: "July",
        day: "13",
        labelIds: "123  ,   555",
      });

      expect(issueData).toEqual({
        title: "test issue (13, July)",
        estimate: 1,
        labelIds: ["123", "555"],
        description:
          "\n\n## Items\n* Item 1\n* Item 2\n* Item 3\n\n## CheckBoxes\n- [ ] CheckBox 1\n- [ ] CheckBox 2\n\n*created by [hoge](https://github.com)*\n",
      });
    });
  });
});
