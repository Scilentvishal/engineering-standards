import pc from 'picocolors';

/**
 * Standardized logger for the engineering-standards CLI.
 */
export const logger = {
  info(message) {
    console.log(pc.cyan('ℹ ') + message);
  },

  success(message) {
    console.log(pc.green('✔ ') + message);
  },

  warn(message) {
    console.warn(pc.yellow('⚠ ') + pc.yellow(message));
  },

  error(message, error) {
    console.error(pc.red('✖ ') + pc.red(message));
    if (error && process.env.DEBUG) {
      console.error(pc.dim(error.stack || error));
    }
  },

  step(current, total, message) {
    console.log(pc.dim(`[${current}/${total}] `) + pc.bold(message));
  },

  heading(title) {
    console.log('\n' + pc.bold(pc.cyan(title)));
    console.log(pc.dim('─'.repeat(Math.max(40, title.length))));
  },

  subheading(title) {
    console.log('\n' + pc.bold(title));
  },

  dim(message) {
    console.log(pc.dim(message));
  },

  log(message) {
    console.log(message);
  }
};
