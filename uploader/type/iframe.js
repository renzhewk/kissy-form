/**
 * @fileoverview iframe�����ϴ�
 * @author: ��ƽ�����ӣ�<minghe36@126.com>,��Ӣ<daxingplay@gmail.com>
 **/
KISSY.add(function(S,Node,UploadType) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader-iframeType]:',ID_PREFIX = 'ks-uploader-iframe-';
    /**
     * @name IframeType
     * @class iframe�����ϴ�
     * @constructor
     * @extends Base
     * @requires Node
     */
    function IframeType(config){
        var self = this;
        //���ø��๹�캯��
        IframeType.superclass.constructor.call(self,config);
    }
    S.mix(IframeType,/**@lends IframeType*/ {
            /**
             * ���õ���htmlģ��
             */
            tpl : {
                IFRAME : '<iframe src="javascript:false;" name="{id}" id="{id}" border="no" width="1" height="1" style="display: none;" />',
                FORM : '<form method="post" enctype="multipart/form-data" action="{action}" target="{target}">{hiddenInputs}</form>',
                HIDDEN_INPUT : '<input type="hidden" name="{name}" value="{value}" />'
            },
            event : {
                //��ʼ�ϴ�
                START : 'start',
                //iframe������ɺ󴥷�
                COMPLETE : 'complete'
            }
    });
    //�̳���Base������getter��setterί����Base����
    S.extend(IframeType, UploadType, /** @lends IframeType.prototype*/{
            /**
             * �ϴ��ļ�
             * @param {HTMLElement} fileInput �ļ�input
             */
            upload : function(fileInput){
                var self = this,$input = $(fileInput),form;
                if(!$input.length) return false;
                self.fire(IframeType.event.START,{input : $input});
                self.set('fileInput',$input);
                //����iframe��form
                self._create();
                form = self.get('form');
                //�ύ������iframe��
                form.getDOMNode().submit();
            },
            /**
             * ����������ת����hiddenԪ��
             * @param {Object} data ��������
             * @return {String} hiddenInputHtml hiddenԪ��htmlƬ��
             */
            dataToHidden : function(data){
                if(!S.isObject(data) || S.isEmptyObject(data)){
                    S.log(LOG_PREFIX + 'data�������Ƕ������Ϊ�գ�');
                    return false;
                }
                var self = this,hiddenInputHtml = EMPTY,
                    //hiddenԪ��ģ��
                    tpl = self.get('tpl'),hiddenTpl = tpl.HIDDEN_INPUT;
                if (!S.isString(hiddenTpl)) return false;
                for (var k in data) {
                    hiddenInputHtml += S.substitute(hiddenTpl, {'name' : k,'value' : data[k]});
                }
                return hiddenInputHtml;
            },
            /**
             * ����һ���յ�iframe�������ļ��ϴ������ύ�󷵻ط�����������
             * @return {NodeList}
             */
            _createIframe : function(){
                var self = this,
                    //iframe��id
                    id = self.get('id'),
                    //iframeģ��
                    tpl = self.get('tpl'),iframeTpl = tpl.IFRAME,
                    existIframe = self.get('iframe'),
                    iframe,$iframe;
                if(!S.isEmptyObject(existIframe)) return existIframe;
                if (!S.isString(iframeTpl)){
                    S.log(LOG_PREFIX + 'iframe��ģ�岻�Ϸ���');
                    return false;
                }
                if (!S.isString(id)){
                    S.log(LOG_PREFIX + 'id���������Ϊ�ַ������ͣ�');
                    return false;
                }
                //���������ϴ���iframe
                iframe = S.substitute(tpl.IFRAME, { 'id' : id });
                $iframe = $(iframe);
                //����iframe��load�¼�
                $iframe.on('load',self._iframeLoadHandler,self);
                return $iframe;
            },
            /**
             * iframe������ɺ󴥷����ļ��ϴ�������
             */
            _iframeLoadHandler : function(ev){
                var self = this,iframe = ev.target,doc = iframe.contentDocument || window.frames[iframe.id].document,
                    result;
                if(!doc || !doc.body){
                    S.log(LOG_PREFIX + 'iframe���ĵ����ݲ��Ϸ���Ϊ��' + doc);
                    return false;
                }
                result = doc.body.innerHTML;
                try{
                    result = JSON.parse(result);
                }catch(err){
                    S.log(LOG_PREFIX + 'json���ݸ�ʽ���Ϸ���');
                }
                self.fire(IframeType.event.COMPLETE,{result : result});
                self._remove();
            },
            /**
             * �����ļ��ϴ�����
             * @return {NodeList}
             */
            _createForm : function(){
                var self = this,
                    //iframe��id
                    id = self.get('id'),
                    //formģ��
                    tpl = self.get('tpl'),formTpl = tpl.FORM,
                    //��Ҫ���͸��������˵�����
                    data = self.get('data'),
                    //�������˴����ļ��ϴ���·��
                    action = self.get('action'),
                    fileInput = self.get('fileInput'),
                    hiddens,form = EMPTY;
                if (!S.isString(formTpl)){
                    S.log(LOG_PREFIX + 'formģ�岻�Ϸ���');
                    return false;
                }
                if (!S.isObject(data)){
                    S.log(LOG_PREFIX + 'data�������Ϸ���');
                    return false;
                }
                if (!S.isString(action)){
                    S.log(LOG_PREFIX + 'action�������Ϸ���');
                    return false;
                }
                hiddens = self.dataToHidden(data);
                if(hiddens == EMPTY) return false;
                form = S.substitute(formTpl, {'action' : action,'target' : id,'hiddenInputs' : hiddens});
                return $(form).append(fileInput.clone());
            },
            /**
             * ����iframe��form
             */
            _create : function(){
                var self = this,
                    iframe = self._createIframe(),
                    form = self._createForm();
                $('body').append(iframe);
                $('body').append(form);
                self.set('iframe',iframe);
                self.set('form',form);
            },
            /**
             * �Ƴ�����
             */
            _remove : function(){
                var self = this,form = self.get('form'),iframe = self.get('iframe');
                //�Ƴ�����
                form.remove();
                self.reset('form');
                //iframe.attr('src','javascript:"<html></html>";');
            }

    },{ATTRS : /** @lends IframeType*/{
            /**
             * iframe�������õ���htmlģ�壬һ�㲻��Ҫ�޸�
             */
            tpl : {value : IframeType.tpl},
            /**
             * ������iframeid
             */
            id : {value : ID_PREFIX + S.guid()},
            iframe : {value : {}},
            form : {value : {}},
            fileInput : {value : EMPTY}
    }});
    
    return IframeType;
},{requires:['node','./base']});