const githubService = require('../services/github.service');

const pushToGitHub = async (req, res) => {
  try {
    console.log('Received push request:', {
      projectName: req.body.projectName,
      repoUrl: req.body.repoUrl,
      branch: req.body.branch
    });

    const { code, projectName, repoUrl, branch = 'main' } = req.body;

    if (!code || !projectName || !repoUrl) {
      console.error('Missing required fields:', { code: !!code, projectName: !!projectName, repoUrl: !!repoUrl });
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: code, projectName, or repoUrl.' 
      });
    }

    if (!process.env.GITHUB_TOKEN) {
      console.error('GitHub token is not configured');
      return res.status(500).json({
        success: false,
        message: 'GitHub token is not configured'
      });
    }

    // Clean repository URL
    let cleanRepoUrl = repoUrl.trim();
    if (cleanRepoUrl.endsWith('.git')) {
      cleanRepoUrl = cleanRepoUrl.slice(0, -4);
    }
    if (!cleanRepoUrl.startsWith('https://github.com/')) {
      cleanRepoUrl = `https://github.com/${cleanRepoUrl}`;
    }

    console.log('Processing push request with cleaned URL:', cleanRepoUrl);

    const result = await githubService.pushToGitHub({
      code,
      projectName,
      repoUrl: cleanRepoUrl,
      branch
    });

    if (result.success) {
      console.log('Push successful:', result);
      res.status(200).json({ 
        success: true,
        message: result.message, 
        url: result.url, 
        branch: result.branch 
      });
    } else {
      let statusCode = 500;
      if (result.status) {
        statusCode = result.status;
      } else if (result.message.includes('token') || result.message.includes('permissions')) {
        statusCode = 401;
      } else if (result.message.includes('repository not found')) {
        statusCode = 404;
      } else if (result.message.includes('URL') || result.message.includes('format')) {
        statusCode = 400;
      }
      console.error('Push failed:', { statusCode, message: result.message });
      res.status(statusCode).json({ 
        success: false,
        message: result.message 
      });
    }
  } catch (error) {
    console.error('Error in pushToGitHub controller:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'An unexpected error occurred during GitHub push.' 
    });
  }
};

module.exports = {
  pushToGitHub
}; 