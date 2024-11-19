import { Box, Heading, Text } from "@chakra-ui/react";

export const TermsOfService = () => {
  return (
    <Box p={8} bg="white" borderRadius="md" boxShadow="md">
      <Heading as="h1" size="lg" mb={4} color="teal.500">
        Terms of Service
      </Heading>
      <Text fontSize="md" color="gray.700" lineHeight="tall">
        These terms and conditions (&quot;Terms&quot;) govern your use of AviMate (&quot;the App&quot;), provided by Ivan Sliepchenko, a private individual located at 17 Route des Boevange, Bissen, Luxembourg, Index - 7762 (&quot;the Company&quot;). By using the App, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you must not use the App.
        <br/><br/>
        <strong>1. Description of the App</strong>
        <br/>
        AviMate is an AI co-pilot desktop app designed for flight simulator users. Users communicate with AviMate via voice conversations, and the app provides assistance with navigation, aviation trivia, environmental trivia, such as city and airport information, and situational awareness.
        <br/><br/>
        <strong>2. User Registration and Accounts</strong>
        <br/>
        a. Users are required to register and create an account to use the App. Account creation is facilitated through Google Auth0 with options for Google authentication and simple login password authentication.
        <br/><br/>
        <strong>3. User Content</strong>
        <br/>
        a. Users do not have the ability to upload their content to the App.
        <br/><br/>
        <strong>4. Payment and Subscriptions</strong>
        <br/>
        a. The App provides free &quot;credits&quot; each month for free users. Additionally, the App offers a subscription service that provides users with more credits each month. Credits are referred to as &quot;words&quot; in the App.
        <br/><br/>
        <strong>5. Data Privacy and Security</strong>
        <br/>
        a. The Company takes user privacy and data security seriously. User data is handled in accordance with the Company&#x27;s Privacy Policy, which can be found at [link to Privacy Policy].
        <br/><br/>
        <strong>6. Integration with Third-Party Services</strong>
        <br/>
        a. The App integrates with third-party services including ChatGPT, Assembly AI, Google Cloud Services, and Firebase. The Company ensures compliance with the terms and conditions of these services.
        <br/><br/>
        <strong>7. Liability and Disclaimers</strong>
        <br/>
        a. The Company disclaims any liability for the accuracy, reliability, or completeness of the information provided by the App.
        <br/><br/>
        <strong>8. Intellectual Property</strong>
        <br/>
        a. All intellectual property rights in the App, including but not limited to trademarks and copyrights, belong to the Company. Users may not use any trademarks, logos, or service marks displayed in the App without the Company&#x27;s prior written consent.
        <br/><br/>
        <strong>9. Jurisdiction and Governing Law</strong>
        <br/>
        a. These Terms shall be governed by and construed in accordance with the laws of Luxembourg, without regard to its conflict of law principles.
        <br/><br/>
        <strong>10. Contact Information</strong>
        <br/>
        a. If you have any questions about these Terms or the App, please contact us at staff@avimate.io. You can also visit our website at avimate.io.
        <br/><br/>
        By using the App, you acknowledge that you have read, understood, and agree to be bound by these Terms.
        <br/><br/>
        Last updated: 4 April 2024
      </Text>
    </Box>
  );
};