import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import nodemailer from 'nodemailer';

const GMAIL_USER = 'wellwutallinn@gmail.com';
const GMAIL_PASS = 'tvby negx skan yqoz';

async function getToEmail(): Promise<string> {
  try {
    const site = await prisma.siteConfig.findUnique({ where: { id: 'main' } });
    if (site?.contactEmail) return site.contactEmail;
  } catch {}
  return 'long.zhuoying@cnp-fi.com';
}

async function sendEmailViaGmail(toEmail: string, name: string, email: string, organization: string | null, message: string): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    const info = await transporter.sendMail({
      from: `"北欧经济文化中心" <${GMAIL_USER}>`,
      replyTo: email,
      to: toEmail,
      subject: `来自「北欧经济文化中心」网站的客户留言`,
      text: `来自「北欧经济文化中心」网站的客户留言\n网址: https://www.estfinfuture.com/\n\n👤 姓名: ${name}
邮箱: ${email}
机构: ${organization || 'N/A'}

留言内容:
${message}

---
提交自 estfinfuture.com 联系表单
时间: ${new Date().toISOString()}`,
      html: `<h2>📬 来自「北欧经济文化中心」网站的客户留言</h2>
<p style="color:#666;">网址: <a href="https://www.estfinfuture.com/">https://www.estfinfuture.com/</a></p>
<hr>
<p><strong>👤 姓名:</strong> ${name}</p>
<p><strong>📧 邮箱:</strong> <a href="mailto:${email}">${email}</a></p>
<p><strong>🏢 机构:</strong> ${organization || 'N/A'}</p>
<p><strong>💬 留言内容:</strong></p>
<blockquote style="background:#f5f5f5;padding:12px;border-left:4px solid #004A99;margin:8px 0;">${message.replace(/\n/g, '<br>')}</blockquote>
<p><small>📅 提交自 estfinfuture.com — ${new Date().toISOString()}</small></p>`,
    });

    console.log('Email sent via Gmail SMTP:', info.messageId);
    return true;
  } catch (err) {
    console.error('Gmail SMTP send error:', err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, organization, message } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Always store in database
    const submission = await prisma.contactSubmission.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        organization: organization?.trim() || null,
        message: message.trim(),
      },
    });

    // Send email via Gmail SMTP
    const toEmail = await getToEmail();
    const mailSent = await sendEmailViaGmail(
      toEmail,
      name.trim(),
      email.trim(),
      organization?.trim() || null,
      message.trim(),
    );

    return NextResponse.json({ 
      success: true, 
      id: submission.id,
      mailSent,
    });
  } catch (err: any) {
    console.error('Contact form error:', err);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
