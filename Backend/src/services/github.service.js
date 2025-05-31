const { Octokit } = require('@octokit/rest');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const os = require('os');

class GitHubService {
  constructor() {
    if (!process.env.GITHUB_TOKEN) {
      console.error('GitHub token is not configured');
      throw new Error('GitHub token is not configured');
    }
    
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
  }

  async verifyTokenPermissions() {
    try {
      console.log('Verifying GitHub token permissions...');
      const response = await this.octokit.request('GET /user', { 
        headers: { authorization: `token ${process.env.GITHUB_TOKEN}` } 
      });
      const scopes = response.headers['x-oauth-scopes'] ? response.headers['x-oauth-scopes'].split(', ') : [];
      console.log('Token scopes:', scopes);

      if (!scopes.includes('repo') && !scopes.includes('workflow')) {
        throw new Error('GitHub token is missing required permissions (repo or workflow scope). Please generate a new token with these permissions.');
      }

      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      throw new Error(`Invalid GitHub token or insufficient permissions: ${error.message}`);
    }
  }

  async createRepository(owner, repo, projectName) {
    try {
      console.log(`Checking if repository ${owner}/${repo} exists...`);
      await this.octokit.repos.get({ owner, repo });
      console.log(`Repository ${owner}/${repo} already exists.`);
      return { success: true, message: 'Repository already exists.' };
    } catch (error) {
      if (error.status === 404) {
        console.log(`Repository ${owner}/${repo} not found. Creating...`);
        const response = await this.octokit.repos.createForAuthenticatedUser({
          name: repo,
          private: true,
          auto_init: false,
        });
        if (response.status !== 201) {
          throw new Error(`Failed to create repository: Status ${response.status}`);
        }
        console.log(`Repository ${owner}/${repo} created successfully.`);
        return { success: true, message: 'Repository created successfully.', url: response.data.html_url };
      } else {
        console.error('Repository creation error:', error);
        throw new Error(`Error checking or creating repository: ${error.message}`);
      }
    }
  }

  async pushToGitHub({ code, projectName, repoUrl, branch = 'main' }) {
    let tempDir;
    try {
      console.log('Starting GitHub push process...');
      await this.verifyTokenPermissions();

      // Clean and validate repository URL
      repoUrl = repoUrl.replace(/\.git$/, '').trim();
      if (!repoUrl.startsWith('https://github.com/')) {
        repoUrl = `https://github.com/${repoUrl}`;
      }

      const [owner, repo] = repoUrl.split('github.com/')[1].split('/');
      if (!owner || !repo) {
        throw new Error('Invalid repository URL format');
      }

      console.log(`Creating temporary directory for ${owner}/${repo}...`);
      // Create temporary directory and initialize git
      tempDir = path.join(os.tmpdir(), `codepilot-${Date.now()}`);
      fs.mkdirSync(tempDir, { recursive: true });
      console.log('Temporary directory created:', tempDir);

      const git = simpleGit(tempDir);
      await git.init();
      console.log('Git repository initialized');

      // Create and commit file
      const fileName = `${projectName.toLowerCase().replace(/\s+/g, '-')}.js`;
      const filePath = path.join(tempDir, fileName);
      fs.writeFileSync(filePath, code);
      console.log('File created:', filePath);

      await git.add(fileName);
      await git.commit('Initial commit from CodePilot');
      console.log('Changes committed');

      // Create repository and push
      await this.createRepository(owner, repo, projectName);
      const token = process.env.GITHUB_TOKEN;
      const remoteUrl = `https://${token}@github.com/${owner}/${repo}.git`;
      
      console.log('Adding remote and pushing changes...');
      await git.addRemote('origin', remoteUrl);
      await git.checkoutLocalBranch(branch);
      await git.push('origin', branch, ['--force']);

      console.log('Successfully pushed to GitHub');
      return {
        success: true,
        message: 'Successfully pushed to GitHub',
        url: `https://github.com/${owner}/${repo}`,
        branch
      };
    } catch (error) {
      console.error('Error in pushToGitHub:', error);
      throw new Error(`Failed to push to GitHub: ${error.message}`);
    } finally {
      if (tempDir && fs.existsSync(tempDir)) {
        console.log('Cleaning up temporary directory:', tempDir);
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  }
}

module.exports = new GitHubService(); 