// Telegram Bot API helper for Sunbeam Fund notifications

interface TelegramMessage {
  chatId: number | string;
  text: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disableWebPagePreview?: boolean;
  disableNotification?: boolean;
  replyToMessageId?: number;
}

interface TelegramResponse {
  ok: boolean;
  result?: any;
  error_code?: number;
  description?: string;
}

interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
}

interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

export class TelegramBot {
  private botToken: string;
  private apiUrl: string;

  constructor(botToken: string) {
    if (!botToken) {
      throw new Error('Telegram bot token is required');
    }
    this.botToken = botToken;
    this.apiUrl = `https://api.telegram.org/bot${botToken}`;
  }

  /**
   * Send a text message to a Telegram chat
   */
  async sendMessage(
    chatId: number | string,
    text: string,
    options?: {
      parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
      disableWebPagePreview?: boolean;
      disableNotification?: boolean;
      replyToMessageId?: number;
      replyMarkup?: InlineKeyboardMarkup;
    }
  ): Promise<TelegramResponse> {
    const params: any = {
      chat_id: chatId,
      text,
      ...options,
    };

    if (options?.replyMarkup) {
      params.reply_markup = JSON.stringify(options.replyMarkup);
    }

    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      return data as TelegramResponse;
    } catch (error) {
      return {
        ok: false,
        description: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Send a photo with optional caption
   */
  async sendPhoto(
    chatId: number | string,
    photo: string | Buffer,
    caption?: string,
    options?: {
      parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
      disableNotification?: boolean;
    }
  ): Promise<TelegramResponse> {
    const formData = new FormData();
    formData.append('chat_id', chatId.toString());
    
    if (typeof photo === 'string') {
      formData.append('photo', photo);
    } else {
      formData.append('photo', new Blob([photo]), 'image.png');
    }
    
    if (caption) {
      formData.append('caption', caption);
    }
    
    if (options?.parseMode) {
      formData.append('parse_mode', options.parseMode);
    }
    
    if (options?.disableNotification) {
      formData.append('disable_notification', 'true');
    }

    try {
      const response = await fetch(`${this.apiUrl}/sendPhoto`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      return data as TelegramResponse;
    } catch (error) {
      return {
        ok: false,
        description: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Send a document/file
   */
  async sendDocument(
    chatId: number | string,
    document: string | Buffer,
    filename: string,
    caption?: string,
    options?: {
      parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
      disableNotification?: boolean;
    }
  ): Promise<TelegramResponse> {
    const formData = new FormData();
    formData.append('chat_id', chatId.toString());
    
    if (typeof document === 'string') {
      formData.append('document', document);
    } else {
      formData.append('document', new Blob([document]), filename);
    }
    
    if (caption) {
      formData.append('caption', caption);
    }
    
    if (options?.parseMode) {
      formData.append('parse_mode', options.parseMode);
    }
    
    if (options?.disableNotification) {
      formData.append('disable_notification', 'true');
    }

    try {
      const response = await fetch(`${this.apiUrl}/sendDocument`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      return data as TelegramResponse;
    } catch (error) {
      return {
        ok: false,
        description: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Set webhook URL for the bot
   */
  async setWebhook(url: string, options?: {
    certificate?: string;
    maxConnections?: number;
    allowedUpdates?: string[];
    dropPendingUpdates?: boolean;
    secretToken?: string;
  }): Promise<TelegramResponse> {
    const params: any = {
      url,
      ...options,
    };

    if (options?.allowedUpdates) {
      params.allowed_updates = JSON.stringify(options.allowedUpdates);
    }

    try {
      const response = await fetch(`${this.apiUrl}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      return data as TelegramResponse;
    } catch (error) {
      return {
        ok: false,
        description: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get webhook info
   */
  async getWebhookInfo(): Promise<TelegramResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/getWebhookInfo`);
      const data = await response.json();
      return data as TelegramResponse;
    } catch (error) {
      return {
        ok: false,
        description: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(dropPendingUpdates?: boolean): Promise<TelegramResponse> {
    const params = dropPendingUpdates ? { drop_pending_updates: true } : {};

    try {
      const response = await fetch(`${this.apiUrl}/deleteWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      return data as TelegramResponse;
    } catch (error) {
      return {
        ok: false,
        description: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Format a message for investors with consistent styling
   */
  static formatInvestorMessage(
    title: string,
    content: string,
    options?: {
      footer?: string;
      linkUrl?: string;
      linkText?: string;
    }
  ): string {
    let message = `<b>📊 ${title}</b>\n\n${content}`;

    if (options?.linkUrl && options?.linkText) {
      message += `\n\n<a href="${options.linkUrl}">${options.linkText}</a>`;
    }

    if (options?.footer) {
      message += `\n\n<i>${options.footer}</i>`;
    }

    return message;
  }

  /**
   * Format a monthly report notification
   */
  static formatReportNotification(
    reportMonth: string,
    highlights: string[],
    reportUrl: string
  ): string {
    const highlightsList = highlights.map(h => `• ${h}`).join('\n');
    
    return TelegramBot.formatInvestorMessage(
      `Monthly Report - ${reportMonth}`,
      `Your monthly investment report is ready!\n\n<b>Highlights:</b>\n${highlightsList}`,
      {
        linkUrl: reportUrl,
        linkText: '📄 View Full Report',
        footer: 'Sunbeam Fund Management'
      }
    );
  }

  /**
   * Format a portfolio update notification
   */
  static formatPortfolioUpdate(
    updateType: 'new_position' | 'position_exit' | 'significant_change',
    details: {
      projectName: string;
      symbol: string;
      change?: string;
      reason?: string;
    }
  ): string {
    let title = '';
    let content = '';

    switch (updateType) {
      case 'new_position':
        title = 'New Portfolio Position';
        content = `We've added <b>${details.projectName} (${details.symbol})</b> to the portfolio.`;
        break;
      case 'position_exit':
        title = 'Position Exit';
        content = `We've exited our position in <b>${details.projectName} (${details.symbol})</b>.`;
        break;
      case 'significant_change':
        title = 'Significant Portfolio Update';
        content = `<b>${details.projectName} (${details.symbol})</b> has seen a significant change: ${details.change}`;
        break;
    }

    if (details.reason) {
      content += `\n\n<b>Reason:</b> ${details.reason}`;
    }

    return TelegramBot.formatInvestorMessage(title, content, {
      footer: 'This is an automated notification from Sunbeam Fund'
    });
  }
}

// Export utility functions for Edge Functions
export const createTelegramBot = (token: string) => new TelegramBot(token);

export const sendTelegramMessage = async (
  token: string,
  chatId: number | string,
  text: string,
  options?: any
) => {
  const bot = new TelegramBot(token);
  return bot.sendMessage(chatId, text, options);
};