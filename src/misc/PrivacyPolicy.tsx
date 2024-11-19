import { Box, Heading, Text } from "@chakra-ui/react";

export const PrivacyPolicy = () => {
  return (
    <Box p={8} bg="white" borderRadius="md" boxShadow="md">
      <Heading as="h1" size="lg" mb={4} color="teal.500">
        Privacy Policy
      </Heading>
      <Text fontSize="md" color="gray.700" lineHeight="tall">
        This Privacy Policy describes how Avimate (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and shares personal information when you use our desktop service, Avimate.
        <br/><br/>
        By using Avimate, you agree to the collection and use of information in accordance with this policy.
        <br/><br/>
        <strong>Information We Collect</strong>
        <br/><br/>
        Avimate may collect the following types of personal information from users:
        <br/>
        User Interactions: We store messages exchanged between users and the AI copilot, as well as interactions with the app.
        <br/>
        User Identification: We collect users&#x27; emails and names to personalize their experience and communicate with them.
        <br/><br/>
        <strong>How We Use Information</strong>
        <br/><br/>
        We may use the collected information for the following purposes:
        <br/>
        Debugging and Improvement: Collected messages and interactions are used for debugging purposes and to enhance the functionality of Avimate.
        <br/>
        Personalization: We use user identification information to personalize the user experience and communicate important updates or information.
        <br/>
        Contextual AI: Collected messages help keep the AI copilot in context of conversation, providing a more seamless experience for users.
        <br/><br/>
        <strong>Sharing of Information</strong>
        <br/><br/>
        We may share user interactions with the app with third-party debugging tools like LogRocket for the purpose of improving our service. However, we do not share personal information with third parties for marketing or other purposes.
        <br/><br/>
        <strong>Data Security</strong>
        <br/><br/>
        While we don&#x27;t implement specific measures, we take reasonable precautions to protect the security of users&#x27; personal information and prevent unauthorized access, use, or disclosure.
        <br/><br/>
        <strong>Contact Us</strong>
        <br/><br/>
        If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at staff@avimate.io.
        <br/><br/>
        <strong>Changes to this Privacy Policy</strong>
        <br/><br/>
        We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify users of any material changes by posting the updated policy on our website or through other appropriate means.
        <br/><br/>
        Last updated: 4 April 2024
      </Text>
    </Box>
  );
};