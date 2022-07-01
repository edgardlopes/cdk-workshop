import * as cdk from 'aws-cdk-lib'
import { Capture, Template } from 'aws-cdk-lib/assertions'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { HitCounter } from '../lib/hitcounter'

test('DynamoDB table created with encryption', () => {

    const stack = new cdk.Stack()

    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'hello.handler',
            code: lambda.Code.fromAsset('lambda')
        })
    })

    const template = Template.fromStack(stack)
    template.hasResourceProperties('AWS::DynamoDB::Table', {
        SSESpecification: {
            SSEEnabled: true
        }
    })
    

})

test('check lambda environment variables', () => {
    const stack = new cdk.Stack()

    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'hello.handler',
            code: lambda.Code.fromAsset('lambda')
        })
    })

    const template = Template.fromStack(stack)
    const envCapture = new Capture()

    template.hasResourceProperties('AWS::Lambda::Function', {
        Environment: envCapture
    })

    expect(envCapture.asObject()).toEqual({
        Variables: {
            DOWNSTREAM_FUNCTION_NAME: {Ref: 'TestFunction22AD90FC'},
            HITS_TABLE_NAME: {Ref: 'MyTestConstructHits24A357F0'},
        }
    })
})

test.only('read capacty can be configured', () => {
    const stack = new cdk.Stack()

    expect(() => {
        new HitCounter(stack, 'MyTestConstruct', {
            downstream: new lambda.Function(stack, 'TestFunction', {
                runtime: lambda.Runtime.NODEJS_14_X,
                handler: 'hello.handler',
                code: lambda.Code.fromAsset('lambda')
            }),
            readCapacity: 3
        })
    }).toThrowError("readCapacity must be greater than 5 and less than 20")
})