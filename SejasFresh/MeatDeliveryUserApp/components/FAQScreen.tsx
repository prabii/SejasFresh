import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Color constants
const PRIMARY_RED = '#D32F2F';
const LIGHT_GRAY = '#F5F5F5';
const DARK_GRAY = '#333';
const LIGHT_PINK = '#FFF1F1';

// FAQ data
const faqData = [
  {
    id: '1',
    question: 'How do I place an order?',
    answer: 'You can place an order by browsing our meat categories, selecting your desired products, adding them to cart, and proceeding to checkout. Choose your delivery address and payment method to complete the order.',
  },
  {
    id: '2',
    question: 'What are your delivery hours?',
    answer: 'We deliver from 8 AM to 8 PM, Monday to Sunday. Same-day delivery is available for orders placed before 2 PM.',
  },
  {
    id: '3',
    question: 'Is the meat fresh?',
    answer: 'Yes, all our meat is sourced fresh daily from certified suppliers. We maintain strict quality standards and cold chain to ensure freshness.',
  },
  {
    id: '4',
    question: 'What payment methods do you accept?',
    answer: 'We accept Cash on Delivery (COD), UPI payments, credit/debit cards, and digital wallets.',
  },
  {
    id: '5',
    question: 'Can I cancel my order?',
    answer: 'Yes, you can cancel your order before it goes into preparation. Once the order is being prepared, cancellation may not be possible.',
  },
  {
    id: '6',
    question: 'Do you offer discounts for bulk orders?',
    answer: 'Yes, we offer special discounts for bulk orders above ₹2000. Please contact our customer support for bulk order pricing.',
  },
  {
    id: '7',
    question: 'How do I track my order?',
    answer: 'You can track your order status in the "My Orders" section of your profile. You will also receive SMS/WhatsApp updates about your order status.',
  },
  {
    id: '8',
    question: 'What if I receive damaged or wrong items?',
    answer: 'Please contact our customer support immediately. We will arrange for a replacement or refund based on the situation.',
  },
];

interface FAQItemProps {
  question: string;
  answer: string;
  isExpanded: boolean;
  onPress: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isExpanded, onPress }) => {
  return (
    <TouchableOpacity style={styles.faqItem} onPress={onPress}>
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question}</Text>
        <AntDesign 
          name={isExpanded ? 'up' : 'down'} 
          size={16} 
          color={PRIMARY_RED} 
        />
      </View>
      {isExpanded && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerText}>{answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const FAQScreen: React.FC = () => {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const handleBack = () => {
    router.back();
  };

  const toggleExpanded = (id: string) => {
    if (expandedItems.includes(id)) {
      setExpandedItems(expandedItems.filter(item => item !== id));
    } else {
      setExpandedItems([...expandedItems, id]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <AntDesign name="left" size={20} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Help & FAQ</Text>
        
        {/* Empty view for centering the title */}
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Frequently Asked Questions</Text>
          <Text style={styles.introText}>
            Find answers to common questions about our meat delivery service. 
            If you can&apos;t find what you&apos;re looking for, contact our customer support.
          </Text>
        </View>

        <View style={styles.faqList}>
          {faqData.map((item) => (
            <FAQItem
              key={item.id}
              question={item.question}
              answer={item.answer}
              isExpanded={expandedItems.includes(item.id)}
              onPress={() => toggleExpanded(item.id)}
            />
          ))}
        </View>

      

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  // Header Styles
  header: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: LIGHT_PINK,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },

  // Content Styles
  content: {
    flex: 1,
    backgroundColor: LIGHT_GRAY,
  },

  introSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },

  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 12,
  },

  introText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },

  // FAQ List Styles
  faqList: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },

  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },

  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GRAY,
    flex: 1,
    marginRight: 16,
  },

  answerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  answerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },

  // Contact Section Styles
  contactSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },

  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 8,
  },

  contactText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },

  contactButton: {
    backgroundColor: PRIMARY_RED,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  bottomSpacing: {
    height: 20,
  },
});

export default FAQScreen;