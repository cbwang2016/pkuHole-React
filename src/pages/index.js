import React from 'react';
import TimeAgo from 'react-timeago';
import chineseStrings from 'react-timeago/lib/language-strings/zh-CN';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core/styles';
import withRoot from '../withRoot';
import Toolbar from "@material-ui/core/Toolbar";
import AppBar from "@material-ui/core/AppBar";
import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import CardActions from "@material-ui/core/CardActions/CardActions";
import Chip from '@material-ui/core/Chip';
import Avatar from "@material-ui/core/Avatar/Avatar";
import CardContent from "@material-ui/core/CardContent/CardContent";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import Divider from "@material-ui/core/Divider/Divider";
import LinearProgress from "@material-ui/core/LinearProgress/LinearProgress";

import MenuIcon from '@material-ui/icons/School';
import FavIcon from '@material-ui/icons/Favorite';
import CommentIcon from '@material-ui/icons/Comment';
import Refresh from '@material-ui/icons/Refresh';
import avatarColor from '@material-ui/core/colors/blue';
import Pink from '@material-ui/core/colors/pink';

const IMAGE_BASE = 'https://holeapi.wangcb.com/services/pkuhole/images/';
const AUDIO_BASE = 'https://holeapi.wangcb.com/services/pkuhole/audios/';
const GETCOMMENT_BASE = 'https://holeapi.wangcb.com/services/pkuhole/api.php?action=getcomment&pid=';
const GETLIST_BASE = 'https://holeapi.wangcb.com/services/pkuhole/api.php?action=getlist&p=';

const styles = theme => ({
    root: {
        textAlign: 'center',
        flexGrow: 1,
    },
    flex: {
        flexGrow: 1,
    },
    demo: {
        height: 240,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
    card: {
        maxWidth: 400,

    },
    actions: {
        display: 'flex',
    },
});

const chinese_format = buildFormatter(chineseStrings);

function Time(props) {
    const time = new Date(props.stamp * 1000);
    return (
        <span>
            <TimeAgo date={time} formatter={chinese_format}/>
            &nbsp;
            {time.getHours()}:{pad2(time.getMinutes())}
        </span>
    );
}

function pad2(x) {
    return x < 10 ? '0' + x : '' + x;
}

function Reply(props) {
    return (
        <CardContent>
            <Divider/>
            <CardActions className='actions' style={{paddingTop: '20px'}}>
                <Chip label={<Time stamp={props.info.timestamp}/>} color="white"/>
                <Typography variant="caption" gutterBottom align="center">#{props.info.cid}</Typography>
            </CardActions>


            <Grid container wrap="nowrap" spacing={16} style={{paddingTop: '10px'}}>
                <Grid item>
                    <Avatar
                        style={{backgroundColor: avatarColor[500]}}>{props.info.text.slice(1, 2) === '洞' ? 'DZ' : props.info.text.slice(1, 2)}</Avatar>
                </Grid>
                <Grid item xs>
                    <Typography component="p" align='left' gutterBottom
                                style={{
                                    paddingLeft: '0px',
                                    paddingRight: '20px',
                                    paddingTop: '5px',
                                    paddingBottom: '-5px'
                                }}>{props.info.text}</Typography>
                </Grid>
            </Grid>
        </CardContent>
    );
}

function ReplyPlaceholder(props) {
    return (
        <CircularProgress color="primary"/>
    );
}

function CenteredLine(props) {
    return (
        <p>
            <span>{props.text}</span>
        </p>
    )
}

class FlowChunkItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            replies: [],
            reply_loading: false,
        };
        this.info = props.info;
        if (props.info.reply > 0) {
            this.state.reply_loading = true;
            this.load_replies();
        }
    }

    load_replies() {
        fetch(GETCOMMENT_BASE + this.info.pid)
            .then((res) => res.json())
            .then((json) => {
                if (json.code !== 0)
                    throw new Error(json.code);
                this.setState({
                    replies: json.data,
                    reply_loading: false,
                });
            });
    }

    render() {
        // props.do_show_details
        return (
            <Grid item style={{width: 'calc(100% - 16px)', maxWidth: '600px'}}>
                <Card>
                    <CardContent>
                        <Grid container wrap="nowrap" spacing={16}>
                            <Grid item>
                                <Avatar style={{backgroundColor: avatarColor[500]}}>DZ</Avatar>
                            </Grid>
                            <Grid item xs>
                                <Typography component="p" align='left' gutterBottom
                                            style={{
                                                paddingLeft: '0px',
                                                paddingRight: '20px',
                                                paddingTop: '10px',
                                                paddingBottom: '0px'
                                            }}>{this.info.text}</Typography>
                                {this.info.type === 'audio' ? <audio src={AUDIO_BASE + this.info.url}/> : null}
                                {this.info.type === 'image' ? <img src={IMAGE_BASE + this.info.url} alt="img"
                                                                   style={{
                                                                       maxWidth: '100%',
                                                                       maxHeight: '100%'
                                                                   }}/> : null}
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions className='actions'>
                        <Chip label={this.info.likenum} color="white"
                              avatar={<Avatar style={{color: Pink[500]}}><FavIcon/></Avatar>}/>
                        <Chip label={this.info.reply} color="white" avatar={<Avatar><CommentIcon/></Avatar>}/>
                        <Typography variant="caption" gutterBottom>#{this.info.pid}</Typography>
                        <Chip label={<Time stamp={this.info.timestamp}/>} color="white"/>
                    </CardActions>
                    {this.state.reply_loading && <ReplyPlaceholder count={this.info.reply}/>}
                    {this.state.replies.map((reply) => <Reply info={reply} key={reply.cid}/>)}
                </Card>
            </Grid>
        );
    }
}

function FlowChunk(props) {
    return (
        <div className="flow-chunk">
            <CenteredLine text={props.title}/>
            <Grid
                container
                className="demo"
                direction="column"
                justify="center"
                alignItems="center"
                spacing={16}
            >
                {props.list.map((info) => <FlowChunkItem key={info.pid} info={info} callback={props.callback}/>)}
            </Grid>
        </div>
    );
}

class Index extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: props.mode,
            loaded_pages: 0,
            chunks: [],
            open: false,
            loading: false,
        };
        setTimeout(this.load_page.bind(this, 1), 0);
    }

    load_page(page) {
        if (page > this.state.loaded_pages + 1)
            throw new Error('bad page');
        if (page === this.state.loaded_pages + 1) {
            console.log('fetching page', page);
            this.setState((prev, props) => ({
                loaded_pages: prev.loaded_pages + 1,
                loading: true,
            }));
            fetch(GETLIST_BASE + page)
                .then((res) => res.json())
                .then((json) => {
                    if (json.code !== 0)
                        throw new Error(json.code);
                    this.setState((prev, props) => ({
                        chunks: prev.chunks.concat([{
                            title: 'Page ' + page,
                            data: json.data,
                        }]),
                        loading: false,
                    }));
                })
                .catch((err) => {
                    console.trace(err);
                    alert('load failed');
                });
        }
    }

    handleClose = () => {
        this.setState({
            open: false,
        });
    };

    handleClick = () => {
        this.setState({
            open: true,
        });
    };

    on_scroll(event) {
        if (event.target === document) {
            //console.log(event);
            const avail = document.body.scrollHeight - window.scrollY - window.innerHeight;
            if (avail < window.innerHeight && this.state.loading === false)
                this.load_page(this.state.loaded_pages + 1);
        }
    }

    componentDidMount() {
        window.addEventListener('scroll', this.on_scroll.bind(this));
        window.addEventListener('resize', this.on_scroll.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.on_scroll.bind(this));
        window.removeEventListener('resize', this.on_scroll.bind(this));
    }

    refresh = () => {
        this.setState({
            loaded_pages: 0,
            chunks: [],
            open: false,
            loading: false,
        });
        setTimeout(this.load_page.bind(this, 1), 0);
    }

    render() {
        const {classes} = this.props;
        const {open} = this.state;

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
                            <MenuIcon/>
                        </IconButton>
                        <Dialog open={open} onClose={this.handleClose}>
                            <DialogTitle>Terms of Service</DialogTitle>
                            <DialogContent>
                                <DialogContentText>P大树洞网页版(Unofficial)<br/><br/>

                                    使用本网站时，您需要了解并同意：<br/>

                                    - 所有数据来自 PKU Helper，本站不对其内容负责<br/>
                                    - 关于修改 UI 的建议请到GitHub提交issue
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button color="primary" onClick={this.handleClose}>
                                    OK
                                </Button>
                            </DialogActions>
                        </Dialog>
                        <Typography variant="title" color="inherit" className={classes.flex}>
                            P大树洞
                        </Typography>
                        <Button color="inherit" onClick={this.handleClick}>ToS</Button>
                        <Button color="inherit" href="https://github.com/cbwang2016/pkuHole-React">GitHub</Button>
                    </Toolbar>
                </AppBar>

                <Button variant="fab" color="primary" style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                }} onClick={this.refresh}>
                    <Refresh/>
                </Button>

                <div className="flow-container">
                    {this.state.chunks.map((chunk) => (
                        <FlowChunk title={chunk.title} list={chunk.data} key={chunk.title}
                                   callback={this.props.callback}/>
                    ))}
                    {this.state.loading ? <LinearProgress /> : ''}
                </div>
            </div>
        );
    }
}

Index.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withRoot(withStyles(styles)(Index));
