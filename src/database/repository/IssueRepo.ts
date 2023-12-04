import { Issue, IssueModel } from '../model/Issue.js';

async function create(issue: Issue): Promise<Issue> {
  const now = new Date();
  issue.createdAt = now;
  issue.updatedAt = now;
  const createdProject = await IssueModel.create(issue);
  return createdProject.toObject();
}

export default { create };
