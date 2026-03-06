const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());


let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 5 * 60 * 1000;


async function fetchLeetCode() {
    try {
        const res = await axios.post('https://leetcode.com/graphql', {
            query: `
                query userProblemsSolved($username: String!) {
                    matchedUser(username: $username) {
                        submitStatsGlobal {
                            acSubmissionNum {
                                difficulty
                                count
                            }
                        }
                    }
                }
            `,
            variables: { username: 'Saurabh_Yadav_50' }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com'
            },
            timeout: 10000
        });

        const stats = res.data?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;
        if (stats && Array.isArray(stats)) {
            const allEntry = stats.find(s => s.difficulty === 'All');
            return allEntry ? allEntry.count : 0;
        }
        return 0;
    } catch (err) {
        console.error('LeetCode fetch error:', err.message);
        return 0;
    }
}


async function fetchHackerRank() {
    try {
        const res = await axios.get('https://www.hackerrank.com/rest/hackers/yadavsaurabhraj1/badges', {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        const badges = res.data?.models;
        if (badges && Array.isArray(badges)) {
            return badges.reduce((sum, badge) => sum + (badge.solved || 0), 0);
        }
        return 0;
    } catch (err) {
        console.error('HackerRank fetch error:', err.message);
        return 0;
    }
}

async function fetchGFG() {
    try {
        const res = await axios.get('https://www.geeksforgeeks.org/user/saurabhyadav0810/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        const match = res.data.match(/total_problems_solved["']?\s*:\s*(\d+)/);
        if (match) {
            return parseInt(match[1], 10);
        }
        return 0;
    } catch (err) {
        console.error('GFG fetch error:', err.message);
        return 0;
    }
}



app.get('/dsa-stats', async (req, res) => {
    if (cache.data && (Date.now() - cache.timestamp) < CACHE_TTL) {
        return res.json(cache.data);
    }

    console.log('Fetching coding stats...');

    const [leetcode, hackerrank, gfg] = await Promise.all([
        fetchLeetCode(),
        fetchHackerRank(),
        fetchGFG()
    ]);

    console.log(`LeetCode: ${leetcode}, GFG: ${gfg}, HackerRank: ${hackerrank}`);

    const totalSolved = leetcode + gfg + hackerrank;

    const result = {
        totalSolved,
        breakdown: { leetcode, gfg, hackerrank },
        fetchedAt: new Date().toISOString()
    };

    cache = { data: result, timestamp: Date.now() };
    res.json(result);
});

app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'DSA Stats API is running' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
