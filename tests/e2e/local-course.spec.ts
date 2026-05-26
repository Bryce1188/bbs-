import { expect, test } from "@playwright/test";

const unique = Date.now();

test("local auth, reset, post and admin workflows", async ({ page }) => {
  await page.goto("/auth");
  await page.getByLabel("邮箱").first().fill("xuzirui@qq.com");
  await page.getByLabel("密码").first().fill("xzr1234567");
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/publish");
  await page.getByLabel("标题").fill(`Playwright 本地主题 ${unique}`);
  await page.getByLabel("标签").fill("playwright 本地");
  await page.getByLabel("正文").fill("这是一条由 Playwright 创建的本地 MySQL 主题，用于验证发帖、详情跳转和回帖流程。");
  await page.getByRole("button", { name: "发布帖子" }).click();
  await expect(page.getByRole("heading", { name: `Playwright 本地主题 ${unique}` })).toBeVisible();

  await page.getByLabel("写下你的回复").fill("这是一条 Playwright 本地回复。");
  await page.getByRole("button", { name: "提交回复" }).click();
  await page.waitForURL(/\/posts\/\d+\?notice=reply_created$/);
  await expect(page.getByText("这是一条 Playwright 本地回复。")).toBeVisible();

  await page.goto("/");
  await page.getByRole("link", { name: `Playwright 本地主题 ${unique}` }).click();
  await expect(page.getByRole("heading", { name: `Playwright 本地主题 ${unique}` })).toBeVisible();

  await page.goto("/auth");
  await page.getByRole("button", { name: "退出登录" }).click();
  await page.getByLabel("邮箱").first().fill("user@qq.com");
  await page.getByLabel("密码").first().fill("xzr1234567");
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/admin/posts");
  await expect(page.getByText(`Playwright 本地主题 ${unique}`)).toBeVisible();
});

test("local registration and password reset", async ({ page }) => {
  const email = `playwright${unique}@qq.com`;
  await page.goto("/auth");
  await page.getByLabel("邮箱").first().fill(email);
  await page.getByLabel("密码").first().fill("xzr1234567");
  await page.getByLabel("名字").fill("测试用户");
  await page.getByRole("button", { name: "创建账号" }).click();
  await expect(page.getByText("账号已创建")).toBeVisible();

  await page.goto("/auth/reset");
  await page.getByLabel("注册邮箱").first().fill(email);
  await page.getByRole("button", { name: "发送重置邮件" }).click();
  await expect(page.getByText("本地验证码已生成")).toBeVisible();
  await expect(page.locator("#update-account")).toHaveValue(email);
  await expect(page.locator("#reset-code")).not.toHaveValue("");
  await page.getByLabel("设置新密码").fill("7654321");
  await page.getByLabel("再次确认密码").fill("7654321");
  await expect(page.getByRole("button", { name: "更新密码" })).toBeEnabled();
  await page.getByRole("button", { name: "更新密码" }).click({ force: true });
  await page.waitForURL(/\/auth\?reset=1$/);
  await expect(page.getByText("密码已更新")).toBeVisible();

  await page.getByLabel("邮箱").first().fill(email);
  await page.getByLabel("密码").first().fill("7654321");
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("local websocket sends a message", async ({ page }) => {
  await page.goto("/auth");
  await page.getByLabel("邮箱").first().fill("xuzirui@qq.com");
  await page.getByLabel("密码").first().fill("xzr1234567");
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/messages?peer=yaowentao");
  await expect(page.getByText("已连接")).toBeVisible();
  await page.getByLabel("输入私信内容").fill(`WebSocket 测试 ${unique}`);
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByText(`WebSocket 测试 ${unique}`)).toBeVisible();
});
