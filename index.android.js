/**
 * Created by zxf on 2018.9.4.
 */
import React,{PureComponent} from 'react'
import PropTypes from 'prop-types';
import ReactNative, { requireNativeComponent, View } from 'react-native';

const NativeModules=ReactNative.NativeModules;

const UIManager=NativeModules.UIManager;

const CrosswalkWebViewManager=NativeModules.CrosswalkWebViewManager

const JSNavigationScheme=NativeModules.JSNavigationScheme

const WEBVIEW_REF = 'crosswalkWebView';

const resolveAssetSource = require('react-native/Libraries/Image/resolveAssetSource');
const { StatusBarManager } = NativeModules;
console.log('height', StatusBarManager.HEIGHT)
class MyWebview extends PureComponent{
  static JSNavigationScheme=JSNavigationScheme;
  static propTypes={
    injectedJavaScript:      PropTypes.string,
    localhost:               PropTypes.bool.isRequired,
    onError:                 PropTypes.func,
    onMessage:               PropTypes.func,
    onNavigationStateChange: PropTypes.func,
    onProgress:              PropTypes.func,
    sName:                   PropTypes.bool,
    allowUniversalAccessFromFileURLs: PropTypes.bool,
    domStorageEnabled: PropTypes.bool,
    mediaPlaybackRequiresUserAction:PropTypes.bool,
    javaScriptEnabled:PropTypes.bool,
    userAgent:PropTypes.string,
    scalesPageToFit:PropTypes.bool,
    saveFormDataDisabled:PropTypes.bool,
    source:                  PropTypes.oneOfType([
      PropTypes.shape({
        uri: PropTypes.string,  // URI to load in WebView
      }),
      PropTypes.shape({
        html: PropTypes.string, // static HTML to load in WebView
      }),
      PropTypes.number,           // used internally by React packager
    ]),
    url:PropTypes.string,
    ...View.propTypes
  }
  static defaultProps={
    localhost: false,
    sName:true,
    javaScriptEnabled:true
  }
  constructor(props){
    super(props);
    this.crosswalkWebView=React.createRef()
  }
  getWebViewHandle () {
    return ReactNative.findNodeHandle(this.crosswalkWebView.current);
  }
  onNavigationStateChange (event) {
    console.log(event.nativeEvent)
    let { onNavigationStateChange } = this.props;
    if (onNavigationStateChange) {
      onNavigationStateChange(event.nativeEvent);
    }
  }
  onError (event) {
    let { onError } = this.props;
    if (onError) {
      onError(event.nativeEvent);
    }
  }
  onProgress (event) {
    if (this.props.onProgress) {
      this.props.onProgress(event.nativeEvent.progress / 100);
    }
  }
  goBack () {
    UIManager.dispatchViewManagerCommand(
      this.getWebViewHandle(),
      UIManager.CrosswalkWebView.Commands.goBack,
      null
    );
  }
  goForward () {
    UIManager.dispatchViewManagerCommand(
      this.getWebViewHandle(),
      UIManager.CrosswalkWebView.Commands.goForward,
      null
    );
  }
  reload () {
    UIManager.dispatchViewManagerCommand(
      this.getWebViewHandle(),
      UIManager.CrosswalkWebView.Commands.reload,
      null
    );
  }
  postMessage (data) {

    UIManager.dispatchViewManagerCommand(
      this.getWebViewHandle(),
      UIManager.CrosswalkWebView.Commands.postMessage,
      [String(data)]
    );
  }
  onMessage (event) {
    let {onMessage} = this.props;
    onMessage && onMessage(event);
  }
  render(){
    let source = this.props.source || {};
    if (this.props.url) {
      source.uri = this.props.url;
    }
    let nativeProps = Object.assign({}, this.props, {
      messagingEnabled: typeof this.props.onMessage === 'function',
      onCrosswalkWebViewNavigationStateChange: this.onNavigationStateChange.bind(this),
      onCrosswalkWebViewError: this.onError.bind(this),
      onCrosswalkWebViewProgress: this.onProgress.bind(this)
    });
    return (
      <NativeCrosswalkWebView
        { ...nativeProps }
        ref={this.crosswalkWebView }
        source={ resolveAssetSource(source) }
      />
    );
  }
}

/**
 * 此处requireNativeComponent的第一个参数为源码corssWalkWebViewGroupManager 中
 * public static final String REACT_CLASS = "CrosswalkWebView"; 的值，不能随便写，否则会提示找不到模块
 */
const NativeCrosswalkWebView = requireNativeComponent('CrosswalkWebView', MyWebview, {
  nativeOnly: {
    messagingEnabled: PropTypes.bool,
  },
});
export default MyWebview;
