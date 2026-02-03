/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.99487599918017, "KoPercent": 0.005124000819840131};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1442166295533801, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.2184873949579832, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.2029320987654321, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.0, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.1752827140549273, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.0, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.9892857142857143, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Get correct patient name"], "isController": false}, {"data": [0.17647058823529413, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.0, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.18604651162790697, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9464285714285714, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.275, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.0, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.0019782393669634025, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.16470588235294117, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.16952998379254458, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.1686046511627907, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.21511627906976744, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent for td_ipv"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.20281995661605207, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.2365364308342133, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.12209302325581395, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.14534883720930233, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.31690140845070425, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.1849025974025974, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.22941176470588234, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [0.01314459049544995, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 19516, 1, 0.005124000819840131, 3616.5631789301215, 0, 33749, 2415.0, 8082.5999999999985, 10650.599999999991, 17071.29999999998, 5.416636367622969, 193.78552983894346, 7.449071391265937], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 22, 0, 0.0, 27061.545454545456, 15808, 38894, 25826.5, 38231.0, 38851.7, 38894.0, 0.009302569454252077, 2.113439885897643, 0.147979731656813], "isController": true}, {"data": ["2.0 Register attendance", 976, 1, 0.10245901639344263, 29161.75819672132, 6817, 76065, 27797.0, 44420.000000000015, 51115.35, 63076.09000000001, 0.2777004806835984, 124.90638545367324, 1.1722085437782288], "isController": true}, {"data": ["2.5 Select patient", 952, 0, 0.0, 2153.0819327731115, 616, 18302, 1655.5, 3606.7000000000007, 5735.849999999989, 12184.490000000002, 0.27250116857775286, 6.383616219225902, 0.18894123993184037], "isController": false}, {"data": ["2.5 Select menacwy", 648, 0, 0.0, 2170.9043209876554, 621, 14707, 1718.0, 3530.8, 6012.849999999999, 10590.979999999998, 0.19854267227406733, 5.083735702361555, 0.13843698047234773], "isController": false}, {"data": ["2.3 Search by first/last name", 983, 0, 0.0, 6048.000000000003, 1910, 26182, 4995.0, 11024.000000000002, 13206.4, 19653.479999999992, 0.2790720386283396, 37.93194318296991, 0.21786727809017634], "isController": false}, {"data": ["2.5 Select td_ipv", 619, 0, 0.0, 2254.1098546042003, 667, 19542, 1834.0, 3724.0, 5282.0, 10122.799999999981, 0.1960869409581904, 5.097221029896764, 0.13653319228827124], "isController": false}, {"data": ["4.0 Vaccination for flu", 939, 0, 0.0, 10216.174653887118, 2135, 46660, 8543.0, 17617.0, 22370.0, 31325.600000000002, 0.27366112243027396, 13.398375250473515, 1.6417979618621603], "isController": true}, {"data": ["4.0 Vaccination for hpv", 901, 0, 0.0, 10253.186459489445, 2318, 43259, 8734.0, 17816.200000000004, 21915.1, 30143.480000000018, 0.27132547463136925, 12.726744676818535, 1.633128659769599], "isController": true}, {"data": ["5.8 Consent confirm", 85, 0, 0.0, 6321.917647058823, 1723, 22364, 5455.0, 11773.000000000004, 14781.7, 22364.0, 0.028696070798945875, 2.891893020815961, 0.06329587022607103], "isController": false}, {"data": ["1.2 Sign-in page", 140, 0, 0.0, 135.23571428571432, 100, 1282, 109.5, 126.0, 155.04999999999978, 1190.9800000000007, 0.1565235668590416, 0.9399056763830534, 0.09431156323440298], "isController": false}, {"data": ["Get correct patient name", 982, 0, 0.0, 0.28411405295315756, 0, 99, 0.0, 1.0, 1.0, 1.0, 0.2794212508682119, 0.0, 0.0], "isController": false}, {"data": ["5.9 Patient home page", 85, 0, 0.0, 2356.2823529411753, 680, 9454, 1968.0, 4278.0, 5848.100000000005, 9454.0, 0.02870654715286777, 0.7659582228553423, 0.02143459565730732], "isController": false}, {"data": ["2.4 Patient attending session", 953, 0, 0.0, 7773.768100734523, 2403, 29757, 6751.0, 13162.6, 16518.499999999996, 23453.22000000003, 0.27192095175186426, 37.13722603268615, 0.4041637583655639], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 201.0, 201, 201, 201.0, 201.0, 201.0, 201.0, 4.975124378109452, 23.840757151741293, 3.634172885572139], "isController": false}, {"data": ["5.4 Consent route", 86, 0, 0.0, 2888.104651162789, 765, 14849, 1934.0, 6610.999999999996, 10554.799999999997, 14849.0, 0.028345343848796705, 0.3476730362733058, 0.0450340899109363], "isController": false}, {"data": ["1.1 Homepage", 140, 0, 0.0, 453.65714285714296, 298, 8776, 337.0, 464.10000000000014, 626.2999999999998, 6478.360000000019, 0.15661164004828113, 0.8765051846842765, 0.08488228537773049], "isController": false}, {"data": ["1.3 Sign-in", 140, 0, 0.0, 1919.5999999999997, 1014, 8837, 1434.5, 3649.200000000002, 4564.649999999999, 8374.110000000004, 0.15621391040239588, 2.410636925955722, 0.3455317451771745], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 607, 0, 0.0, 11050.726523887968, 2692, 42909, 9390.0, 18691.0, 22347.600000000002, 32287.199999999935, 0.19544645185802922, 10.131909438079376, 1.1821644522307297], "isController": true}, {"data": ["2.1 Open session", 990, 0, 0.0, 7291.675757575753, 2340, 28411, 6607.0, 11359.099999999999, 14681.299999999996, 21898.620000000017, 0.27941554171335353, 5.056951643471414, 0.18213992703444148], "isController": false}, {"data": ["4.3 Vaccination confirm", 3033, 0, 0.0, 5158.077810748433, 1413, 28512, 4228.0, 9390.4, 11938.399999999976, 19822.559999999998, 0.894282694170356, 19.487863442859375, 2.081361806068473], "isController": false}, {"data": ["5.6 Consent questions", 85, 0, 0.0, 2968.5999999999995, 778, 12156, 1910.0, 7100.000000000001, 8922.600000000004, 12156.0, 0.02876581781558471, 0.36291727779928634, 0.07182101597230495], "isController": false}, {"data": ["4.1 Vaccination questions", 3085, 0, 0.0, 2654.640842787682, 723, 26182, 1885.0, 5324.200000000001, 7605.799999999988, 13707.099999999986, 0.8979064372760691, 11.23038063747355, 1.894880061911158], "isController": false}, {"data": ["5.3 Consent parent details", 86, 0, 0.0, 3479.2441860465115, 739, 23372, 2060.5, 8147.0999999999985, 16112.849999999971, 23372.0, 0.028359205612484648, 0.3322358997452618, 0.052278590551603034], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 86, 0, 0.0, 2668.093023255812, 781, 19955, 1736.5, 5097.999999999996, 8127.549999999992, 19955.0, 0.02835163277382815, 0.4364819888835226, 0.045071768676226004], "isController": false}, {"data": ["1.0 Login", 140, 0, 0.0, 3915.550000000001, 2319, 12232, 3239.5, 6047.3, 7500.299999999995, 11962.220000000003, 0.1560474518008433, 7.992098251655496, 0.617027472989858], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 633, 0, 0.0, 10190.145339652443, 2220, 39075, 8720.0, 17164.400000000005, 22098.499999999993, 33297.15999999998, 0.19676955984234812, 9.935846430450976, 1.186364181812431], "isController": true}, {"data": ["5.0 Consent for td_ipv", 16, 0, 0.0, 32647.8125, 17870, 48732, 34553.0, 46675.4, 48732.0, 48732.0, 0.0075949823748940265, 1.7273467190150826, 0.12178858334116566], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 922, 0, 0.0, 2182.421908893712, 637, 23191, 1733.0, 3571.500000000001, 5287.49999999999, 9743.749999999995, 0.2735237873729316, 6.701288464931551, 0.2038072751616668], "isController": false}, {"data": ["2.5 Select flu", 947, 0, 0.0, 2192.4487856388596, 620, 19277, 1584.0, 3973.8000000000025, 6381.199999999988, 11872.319999999989, 0.2721819681601706, 6.55135963892777, 0.1887199193298058], "isController": false}, {"data": ["5.1 Consent start", 86, 0, 0.0, 3508.5000000000005, 909, 12067, 2221.5, 8243.999999999998, 10010.699999999988, 12067.0, 0.028334071886176104, 0.36801250333584273, 0.061220179213004676], "isController": false}, {"data": ["5.5 Consent agree", 86, 0, 0.0, 2788.906976744187, 827, 15762, 2080.0, 5800.7, 7082.699999999988, 15762.0, 0.02830012346751541, 0.4915944571328815, 0.044437145405211695], "isController": false}, {"data": ["1.5 Open Sessions list", 142, 0, 0.0, 1435.7816901408448, 807, 5867, 1164.5, 2230.1000000000004, 2859.8499999999995, 5140.729999999989, 0.04089490728807726, 0.9889458878658762, 0.02447090863732121], "isController": false}, {"data": ["4.2 Vaccination batch", 3080, 0, 0.0, 2649.542207792209, 717, 24265, 1837.5, 5268.500000000002, 7794.899999999996, 14081.160000000003, 0.8985368144827798, 13.72636178560124, 1.4544984913771097], "isController": false}, {"data": ["5.0 Consent for hpv", 22, 0, 0.0, 28915.454545454544, 14741, 70646, 25924.5, 43160.1, 66665.89999999994, 70646.0, 0.007957829292263217, 1.7843722498013257, 0.12739097163467922], "isController": true}, {"data": ["5.7 Consent triage", 85, 0, 0.0, 2409.7058823529405, 759, 8846, 1712.0, 5461.800000000002, 7272.200000000003, 8846.0, 0.028711249945955294, 0.48333231981917313, 0.04831598016238407], "isController": false}, {"data": ["5.0 Consent for flu", 25, 0, 0.0, 30074.72, 13825, 68846, 26422.0, 54449.8, 64807.399999999994, 68846.0, 0.00915273833456041, 2.084877595739474, 0.1432932692043671], "isController": true}, {"data": ["2.2 Session register", 989, 1, 0.10111223458038422, 6071.488372093023, 1244, 33749, 5118.0, 11184.0, 13381.0, 18285.400000000005, 0.279886596403528, 39.01595375266656, 0.18490485836719422], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 1, 100.0, 0.005124000819840131], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 19516, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.2 Session register", 989, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
