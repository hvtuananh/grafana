import React, { PureComponent } from 'react';
import { e2e } from '@grafana/e2e';
import { Switch, LegacyForms, ClipboardButton, Icon } from '@grafana/ui';
const { Select } = LegacyForms;
import { SelectableValue, PanelModel, AppEvents } from '@grafana/data';
import { DashboardModel } from 'app/features/dashboard/state';
import { buildImageUrl, buildShareUrl } from './utils';
import { appEvents } from 'app/core/core';

const themeOptions: Array<SelectableValue<string>> = [
  { label: 'current', value: 'current' },
  { label: 'dark', value: 'dark' },
  { label: 'light', value: 'light' },
];

export interface Props {
  dashboard: DashboardModel;
  panel?: PanelModel;
}

export interface State {
  useCurrentTimeRange: boolean;
  includeTemplateVars: boolean;
  selectedTheme: SelectableValue<string>;
  shareUrl: string;
  imageUrl: string;
}

export class ShareLink extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      useCurrentTimeRange: true,
      includeTemplateVars: true,
      selectedTheme: themeOptions[0],
      shareUrl: '',
      imageUrl: '',
    };
  }

  componentDidMount() {
    this.buildUrl();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { useCurrentTimeRange, includeTemplateVars, selectedTheme } = this.state;
    if (
      prevState.useCurrentTimeRange !== useCurrentTimeRange ||
      prevState.includeTemplateVars !== includeTemplateVars ||
      prevState.selectedTheme.value !== selectedTheme.value
    ) {
      this.buildUrl();
    }
  }

  buildUrl = () => {
    const { panel } = this.props;
    const { useCurrentTimeRange, includeTemplateVars, selectedTheme } = this.state;

    const shareUrl = buildShareUrl(useCurrentTimeRange, includeTemplateVars, selectedTheme.value, panel);
    const imageUrl = buildImageUrl(useCurrentTimeRange, includeTemplateVars, selectedTheme.value, panel);
    this.setState({ shareUrl, imageUrl });
  };

  onUseCurrentTimeRangeChange = () => {
    this.setState({ useCurrentTimeRange: !this.state.useCurrentTimeRange });
  };

  onIncludeTemplateVarsChange = () => {
    this.setState({ includeTemplateVars: !this.state.includeTemplateVars });
  };

  onThemeChange = (value: SelectableValue<string>) => {
    this.setState({ selectedTheme: value });
  };

  onShareUrlCopy = () => {
    appEvents.emit(AppEvents.alertSuccess, ['Content copied to clipboard']);
  };

  getShareUrl = () => {
    return this.state.shareUrl;
  };

  render() {
    const { panel } = this.props;
    const { useCurrentTimeRange, includeTemplateVars, selectedTheme, shareUrl, imageUrl } = this.state;
    const selectors = e2e.pages.SharePanelModal.selectors;

    return (
      <div className="share-modal-body">
        <div className="share-modal-header">
          <Icon name="link" className="share-modal-big-icon" size="xxl" />
          <div className="share-modal-content">
            <p className="share-modal-info-text">
              Create a direct link to this dashboard or panel, customized with the options below.
            </p>
            <div className="gf-form-group">
              <Switch
                labelClass="width-12"
                label="Current time range"
                checked={useCurrentTimeRange}
                onChange={this.onUseCurrentTimeRangeChange}
              />
              <Switch
                labelClass="width-12"
                label="Template variables"
                checked={includeTemplateVars}
                onChange={this.onIncludeTemplateVarsChange}
              />
              <div className="gf-form">
                <label className="gf-form-label width-12">Theme</label>
                <Select width={10} options={themeOptions} value={selectedTheme} onChange={this.onThemeChange} />
              </div>
            </div>
            <div>
              <div className="gf-form-group">
                <div className="gf-form-inline">
                  <div className="gf-form gf-form--grow">
                    <input type="text" className="gf-form-input" defaultValue={shareUrl} />
                  </div>
                  <div className="gf-form">
                    <ClipboardButton variant="primary" getText={this.getShareUrl} onClipboardCopy={this.onShareUrlCopy}>
                      Copy
                    </ClipboardButton>
                  </div>
                </div>
              </div>
            </div>
            {panel && (
              <div className="gf-form">
                <a href={imageUrl} target="_blank" aria-label={selectors.linkToRenderedImage}>
                  <i className="fa fa-camera"></i> Direct link rendered image
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
