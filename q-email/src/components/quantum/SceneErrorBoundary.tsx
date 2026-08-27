import { Component, ErrorInfo, ReactNode } from 'react';
import { WebGLFallback2D } from './WebGLFallback2D';
import { SessionState, SecurityDecision } from '../../types';

interface Props {
  children: ReactNode;
  sessionState?: SessionState;
  decision?: SecurityDecision | string;
}

interface State {
  hasError: boolean;
}

export class SceneErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('3D Scene Rendering encountered an issue, falling back to 2D:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <WebGLFallback2D
          sessionState={this.props.sessionState}
          decision={this.props.decision}
        />
      );
    }

    return this.props.children;
  }
}
