import { describe, it, expect, beforeEach } from 'vitest';
import { initPlugin } from '../src/plugin.js';
import { createMockPluginAPI } from './mockPluginAPI.js';

describe('plugin', () => {
  let mockPluginAPI;

  beforeEach(() => {
    mockPluginAPI = createMockPluginAPI();
  });

  describe('initPlugin', () => {
    it('should register a header button', () => {
      initPlugin(mockPluginAPI);
      
      expect(mockPluginAPI.registerHeaderButton).toHaveBeenCalled();
      
      const buttons = mockPluginAPI._getHeaderButtons();
      expect(buttons).toHaveLength(1);
    });

    it('should register button with correct configuration', () => {
      initPlugin(mockPluginAPI);
      
      const buttons = mockPluginAPI._getHeaderButtons();
      const button = buttons[0];
      
      expect(button.id).toBe('date-range-reporter-btn');
      expect(button.label).toBe('Task Report');
      expect(button.icon).toBe('summarize');
      expect(button.onClick).toBeDefined();
    });

    it('should call showIndexHtmlAsView when button is clicked', () => {
      initPlugin(mockPluginAPI);
      
      const buttons = mockPluginAPI._getHeaderButtons();
      const button = buttons[0];
      
      button.onClick();
      
      expect(mockPluginAPI.showIndexHtmlAsView).toHaveBeenCalled();
    });
  });
});
