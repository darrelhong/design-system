import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  Box,
  FormHelperText,
  FormLabel as ChakraFormLabel,
  FormLabelProps as ChakraFormLabelProps,
  Icon,
  Text,
  TextProps,
  useFormControlContext,
  VisuallyHidden,
} from '@chakra-ui/react'

import { useMdComponents } from '~/hooks/useMdComponents'
import { BxsHelpCircle } from '~/icons/BxsHelpCircle'
import { Tooltip } from '~/Tooltip'
import type { WithReactMarkdownSsr } from '~/types/WithSsr'

export interface FormLabelProps
  extends ChakraFormLabelProps,
    WithReactMarkdownSsr {
  /**
   * Question number to be prefixed before each label, if any.
   */
  questionNumber?: string
  /**
   * Tooltip text to be postfixed at the end of each label, if any.
   */
  tooltipText?: string
  /**
   * Description text to be shown below the label text, if any.
   */
  description?: string
  /**
   * Label text.
   */
  children: string
  /**
   * Whether form label is required. This is optional; if this prop is not
   * provided, the value from it's parent `FormContext` (if any) will be used.
   */
  isRequired?: boolean

  /**
   * Whether markdown is enabled for description text.
   */
  useMarkdownForDescription?: boolean
}

/**
 * @preconditions Must be a child of Chakra's `FormControl` component.
 * Used to enhance the usability of form controls.
 *
 * It is used to inform users as to what information
 * is requested for a form field.
 *
 * ♿️ Accessibility: Every form field should have a form label.
 */
export const FormLabel = ({
  isRequired,
  tooltipText,
  questionNumber,
  description,
  useMarkdownForDescription = false,
  children,
  ssr,
  mdIsExternalLinkFn,
  ...labelProps
}: FormLabelProps): JSX.Element => {
  return (
    <FormLabel.Label
      requiredIndicator={<Box />}
      display="flex"
      flexDir="column"
      {...labelProps}
    >
      <Box>
        {questionNumber && (
          <FormLabel.QuestionNumber>{questionNumber}</FormLabel.QuestionNumber>
        )}
        {children}
        <FormLabel.OptionalIndicator isRequired={isRequired} />
        {tooltipText && (
          <Tooltip label={tooltipText} aria-label="Label tooltip">
            <Icon
              ml="0.5rem"
              color="base.content.strong"
              as={BxsHelpCircle}
              verticalAlign="middle"
            />
          </Tooltip>
        )}
      </Box>
      {description && (
        <FormLabel.Description
          ssr={ssr}
          mdIsExternalLinkFn={mdIsExternalLinkFn}
          useMarkdown={useMarkdownForDescription}
        >
          {description}
        </FormLabel.Description>
      )}
    </FormLabel.Label>
  )
}

FormLabel.Label = ChakraFormLabel

interface FormLabelDescriptionProps extends TextProps, WithReactMarkdownSsr {
  useMarkdown?: boolean
  children: string
}
const FormLabelDescription = ({
  children,
  useMarkdown = false,
  ssr,
  mdIsExternalLinkFn,
  ...props
}: FormLabelDescriptionProps): JSX.Element => {
  // useFormControlContext is a ChakraUI hook that returns props passed down
  // from a parent ChakraUI's `FormControl` component.
  // The return object is used to determine whether FormHelperText or Text is
  // used.
  // Using FormHelperText allows for the children text to be added to the parent
  // FormLabel's aria-describedby attribute. This is done internally by ChakraUI.
  const field = useFormControlContext()

  // Render normal Text component if no form context is found.
  const ComponentToRender = useMemo(() => {
    if (field) return FormHelperText
    return Text
  }, [field])

  const styleProps = {
    textStyle: 'body-2',
    color: 'base.content.strong',
    mt: 0,
    ...props,
  }

  const mdComponentsStyles = {
    text: styleProps,
    link: { display: 'initial' },
  }
  const mdComponents = useMdComponents({
    ssr,
    styles: mdComponentsStyles,
    props: {
      link: {
        isExternalFn: mdIsExternalLinkFn,
      },
    },
    overrides: {
      p: (props) => (
        <ComponentToRender {...props} sx={mdComponentsStyles.text} />
      ),
    },
  })

  return useMarkdown ? (
    <ReactMarkdown components={mdComponents}>{children}</ReactMarkdown>
  ) : (
    <ComponentToRender {...styleProps}>{children}</ComponentToRender>
  )
}
FormLabel.Description = FormLabelDescription

FormLabel.Description = FormLabelDescription

FormLabel.QuestionNumber = ({ children, ...props }: TextProps): JSX.Element => {
  return (
    <Text
      as="span"
      textStyle="caption-1"
      color="base.content.strong"
      mr="0.5rem"
      verticalAlign="baseline"
      lineHeight={0}
      {...props}
    >
      <VisuallyHidden>Question number:</VisuallyHidden>
      {children}
    </Text>
  )
}

FormLabel.OptionalIndicator = ({
  isRequired,
  ...props
}: TextProps & { isRequired?: boolean }): JSX.Element | null => {
  // useFormControlContext is a ChakraUI hook that returns props passed down
  // from a parent ChakraUI's `FormControl` component.
  // Valid hook usage since composited component is still a component.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const field = useFormControlContext()

  // If isRequired is explicitly provided, ignore form control context value.
  if (isRequired ?? field?.isRequired) return null

  return (
    <Text
      as="span"
      role="presentation"
      textStyle="body-2"
      ml="0.5rem"
      color="neutral.700"
      lineHeight={0}
      {...props}
    >
      (optional)
    </Text>
  )
}
