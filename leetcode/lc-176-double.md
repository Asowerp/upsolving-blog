# LeetCode 第 176 场双周赛

T1 - 3 有点蠢，在此不赘述了

## T4. 查询树上回文路径

这题似乎欧拉序结合树上差分也可以，但我不是很有思维所以选择了最暴力的 HLD。

### 题意

给你一棵包含 $n$ 个节点的无向树，节点编号从 $0$ 到 $n - 1$。

另给你一个长度为 $n$ 且由小写英文字母组成的字符串 $s$，其中 $s[i]$ 表示分配给节点 $i$ 的字符。

现在有 $q$ 个询问，其中每个询问为以下形式之一：

- `"update u c"`：将节点 $u$ 处的字符更改为 $c$。正式地，更新 $s[u_i] = c$。
- `"query u v"`：判断从 $u$ 到 $v$ 的 **唯一** 路径（含两端点）上的字符所组成的字符串，是否可以 **重新排列** 成一个 **回文串**。

数据范围：$n\leq 5\times 10^4, q\leq 5\times 10^4$。

### 思路

首先路径问题转化为 HLD 是十分自然的。接下来思考回文怎么处理。显然重排成回文等价于至多一个字符出现奇数次。而且字符的数目有限，这启发我们用 `int` 状态压缩一下 26 个字母。

然后就容易了，我们每一次都往上跳，每次都跳完整个路径。这样就是 HLD 板子题了。时间复杂度 $O(n+q\log^2n)$ 显然能过。

一个更进一步的思考是，如果我们把所有字母变成 $10^{18}$ 以内的自然数，那怎么办呢？答案是随机化。我们考虑**哈希**。给每个值赋一个 `unsigned long long` 内的随机数。这样依然考虑对路径异或。类似前面的思路，我们只用看路径异或的结果是不是在我们一开始的那一堆随机数里面就好了。

我们接下来思考一下单次查询碰撞的概率。首先我们说明，每次异或完的结果在 $[0, 2^{64} - 1]$ 内也是均匀随机分布的。

我们不妨归纳证明。令 $P_i(m)$ 表示第 $i$ 次哈希之后的结果为 $m$ 的概率。

一开始的 key 在 $[0, 2^{64} - 1]$ 内均匀分布，所以满足 $P_0(m) = \dfrac{1}{2^{64}}$ 对所有 $m$ 成立。假定 $P_k(m) = \dfrac{1}{2^{64}}$。那么对于任意的目标值 $m'$，我们有
$$
P_{k+1}(m') = \sum_s P_{k+1}(m' \oplus s \mid s) \cdot P_k(s)
$$
前一项表示 $P_k(s)$ 的情况下选中了 $m' \oplus s$。因为两次查询认为是独立的，不难得到 $P_{k+1}(m') = \dfrac{1}{2^{64}}$。于是经过若干步得到任意值的概率都是 $\dfrac{1}{2^{64}}$。

特别地，和 key 中的任意一个以及 $0$ 碰撞的概率就是 $\dfrac{n+1}{2^{64}} \approx \dfrac{n}{2^{64}}$。也就是说单次查询出错的概率就是这么多。

因此任意一次查询出错的概率的上界就是 $\dfrac{n q}{2^{64}} \approx 5.5 \times 10^{-8}$。因此这个做法是安全的，并且和值域无关。

代码如下：

```cpp
const int MAXN = 5e4 + 5;

class Solution {
    int head[MAXN], nxt[MAXN << 1], to[MAXN << 1];
    int ecnt = 0;
    int pa[MAXN];
    int sz[MAXN], dep[MAXN], dfn[MAXN], seg[MAXN], son[MAXN], d = 0, top[MAXN];

    void add_edge(int u, int v) {
        nxt[++ecnt] = head[u], to[ecnt] = v, head[u] = ecnt;
    }
    void dfs1(int u, int fa) {
        if (fa != -1)
            pa[u] = fa;
        sz[u] = 1;
        if (fa != -1)
            dep[u] = dep[fa] + 1;
        for (int e = head[u]; e; e = nxt[e]) {
            int v = to[e];
            if (v == fa)
                continue;
            dfs1(v, u);
            sz[u] += sz[v];
            if (son[u] == -1 || sz[v] > sz[son[u]])
                son[u] = v;
        }
    }

    void dfs2(int u, int t) {
        dfn[u] = ++d, seg[d] = u, top[u] = t;
        if (son[u] != -1)
            dfs2(son[u], t);
        for (int e = head[u]; e; e = nxt[e]) {
            int v = to[e];
            if (v == pa[u] || v == son[u])
                continue;
            dfs2(v, v);
        }
    }

    int s[MAXN << 2];
#define lson(x) (x << 1)
#define rson(x) (x << 1 | 1)
    void build(int l, int r, int p, const string& str) {
        if (l == r) {
            char ch = str[seg[l]];
            int t = ch - 'a';
            s[p] = 1 << t;
            return;
        }
        int mid = l + r >> 1;
        build(l, mid, lson(p), str), build(mid + 1, r, rson(p), str);
        s[p] = s[lson(p)] ^ s[rson(p)];
    }
    void modify(int pos, char val, int l, int r, int p) {
        if (l == r) {
            int t = val - 'a';
            s[p] = 1 << t;
            return;
        }
        int mid = l + r >> 1;
        if (pos <= mid)
            modify(pos, val, l, mid, lson(p));
        else
            modify(pos, val, mid + 1, r, rson(p));
        s[p] = s[lson(p)] ^ s[rson(p)];
    }
    int query(int ql, int qr, int l, int r, int p) {
        if (ql <= l && r <= qr) {
            return s[p];
        }
        int ret = 0, mid = l + r >> 1;
        if (ql <= mid)
            ret ^= query(ql, qr, l, mid, lson(p));
        if (mid < qr)
            ret ^= query(ql, qr, mid + 1, r, rson(p));
        return ret;
    }

public:
    vector<bool> palindromePath(int n, vector<vector<int>>& edges, string str,
                                vector<string>& queries) {
        memset(son, -1, sizeof(son));
        ecnt = 0, d = 0;
        memset(head, 0, sizeof(head));
        vector<bool> ans;
        for (auto& e : edges) {
            int u = e[0], v = e[1];
            add_edge(u, v), add_edge(v, u);
        }
        dfs1(0, -1);
        dfs2(0, 0);
        build(1, n, 1, str);
        for (string& q : queries) {
            stringstream ss(q);
            string op;
            ss >> op;
            if (op == "query") {
                int u, v;
                ss >> u >> v;
                int cur = 0;
                while (top[u] != top[v]) {
                    if (dep[top[u]] < dep[top[v]])
                        swap(u, v);
                    cur ^= query(dfn[top[u]], dfn[u], 1, n, 1);
                    u = pa[top[u]];
                }
                if (dfn[u] > dfn[v])
                    swap(u, v);
                cur ^= query(dfn[u], dfn[v], 1, n, 1);
                ans.push_back(__builtin_popcount(cur) <= 1);
            } else {
                int u;
                char ch;
                ss >> u >> ch;
                modify(dfn[u], ch, 1, n, 1);
            }
        }
        return ans;
    }
};
```
