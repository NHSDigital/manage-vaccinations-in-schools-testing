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

    var data = {"OkPercent": 98.53966016756715, "KoPercent": 1.4603398324328556};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5958711433756806, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.40630797773654914, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.8739913097454997, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7533783783783784, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.8754623921085081, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.37889688249400477, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.36034912718204487, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5912139503688799, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.10357142857142858, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.48936170212765956, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.7018043684710351, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.5957233544938189, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.58591123066577, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.35142215568862273, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.3765743073047859, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.8577586206896551, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.5681963033779477, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.7722989949748744, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.24529253530598522, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.375, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.39182156133828994, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [0.296551724137931, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.37962962962962965, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.10416666666666667, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [0.7498463429625076, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.7831552482715274, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.8740763546798029, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.865625, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.09006211180124224, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 25542, 373, 1.4603398324328556, 1244.122817320496, 10, 31356, 424.0, 2080.0, 2984.0, 30002.0, 6.721228735976388, 335.4565631452789, 1.2685379321024852], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 1617, 2, 0.12368583797155226, 1851.7699443413735, 341, 6668, 944.0, 5364.8, 5739.1, 6258.5999999999985, 0.45333203249187953, 63.69298656910986, 0.06048413379939343], "isController": true}, {"data": ["2.5 Select patient", 1611, 0, 0.0, 309.8696461824945, 49, 1656, 117.0, 899.1999999999998, 1020.3999999999992, 1246.8799999999999, 0.4532144041721607, 11.326835850651928, 0.0], "isController": false}, {"data": ["7.1 Full name search", 148, 0, 0.0, 682.4797297297299, 226, 2619, 444.0, 1367.3999999999999, 1815.6499999999992, 2514.139999999998, 0.04373323436226602, 1.7179593089402847, 0.0], "isController": false}, {"data": ["2.3 Search by first/last name", 1622, 0, 0.0, 294.70776818742297, 53, 1869, 110.0, 864.0, 973.0, 1231.2499999999995, 0.45430254196556713, 14.038587716031783, 0.0], "isController": false}, {"data": ["4.0 Vaccination for flu", 417, 0, 0.0, 2064.496402877697, 366, 8090, 918.0, 6127.2, 6544.4, 7159.0199999999995, 0.11936665256403578, 6.54225658890683, 0.27781438907746464], "isController": true}, {"data": ["4.0 Vaccination for hpv", 401, 0, 0.0, 2307.229426433915, 290, 8187, 891.0, 6461.2, 6771.7, 7664.340000000009, 0.11460240396404285, 5.855039843894235, 0.272066281164852], "isController": true}, {"data": ["1.2 Sign-in page", 2982, 71, 2.380952380952381, 1737.5224681421837, 10, 31216, 594.0, 2638.100000000001, 3706.6999999999944, 30164.25, 0.8224124207993673, 49.94723060477374, 0.0], "isController": false}, {"data": ["7.2 First name search", 140, 0, 0.0, 2266.221428571428, 1264, 8274, 1847.0, 3403.4, 5208.7, 7935.340000000003, 0.04025940862379538, 5.44994585693661, 0.0], "isController": false}, {"data": ["7.7 Due vaccination search", 141, 0, 0.0, 796.063829787234, 489, 4252, 624.0, 1314.2, 1488.3000000000002, 3228.8800000000306, 0.042464136627305527, 5.6606049362601265, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 1053, 2, 0.1899335232668566, 752.009496676165, 138, 2855, 381.0, 1924.0, 2100.7, 2479.9600000000028, 0.2957164088064515, 9.64084578025954, 0.06058737408883961], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 30.0, 30, 30, 30.0, 30.0, 30.0, 30.0, 33.333333333333336, 10.44921875, 19.661458333333336], "isController": false}, {"data": ["1.1 Homepage", 2993, 39, 1.3030404276645506, 1395.6014032743074, 24, 31356, 559.0, 2429.5999999999985, 3251.6999999999975, 30060.12, 0.8280568800100484, 50.66110411342028, 0.0], "isController": false}, {"data": ["1.3 Sign-in", 2974, 67, 2.2528581035642232, 1707.4045057162093, 34, 31226, 602.5, 2638.0, 3593.75, 30153.25, 0.8281665745398649, 50.64519019340363, 0.2358522993875076], "isController": false}, {"data": ["Run some searches", 1336, 125, 9.3562874251497, 4339.465568862272, 0, 30150, 1433.5, 15447.49999999909, 30001.0, 30082.26, 0.37416963607801884, 38.856629079999905, 0.0], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 397, 0, 0.0, 2148.586901763226, 180, 8270, 900.0, 6349.0, 6727.4, 7333.719999999999, 0.11390567347805379, 5.905919844799933, 0.2702026335665961], "isController": true}, {"data": ["2.1 Open session", 1624, 0, 0.0, 445.6496305418714, 108, 1714, 287.5, 1010.5, 1133.75, 1348.5, 0.45413336867967435, 10.357996594943517, 0.0], "isController": false}, {"data": ["4.3 Vaccination confirm", 1569, 0, 0.0, 1110.7546207775663, 319, 4678, 577.0, 2864.0, 3135.0, 3572.699999999998, 0.45246689623570036, 10.08568897123836, 0.2940904153726853], "isController": false}, {"data": ["4.1 Vaccination questions", 1592, 0, 0.0, 554.6199748743719, 71, 3030, 179.5, 1722.7, 1930.7999999999993, 2364.21, 0.45386512337319856, 6.627112681389249, 0.6351775316094821], "isController": false}, {"data": ["1.0 Login", 2974, 71, 2.387357094821789, 5168.502689979832, 314, 93044, 1865.5, 8084.0, 10563.25, 90151.25, 0.8281326749854924, 189.10636353191833, 0.2358426451849682], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 376, 0, 0.0, 2195.037234042551, 315, 8824, 896.5, 6373.0, 6926.699999999999, 7613.530000000008, 0.10778966681239295, 5.9711601946879185, 0.2556510739548917], "isController": true}, {"data": ["7.0 Open Children Search", 1345, 69, 5.130111524163569, 3004.686988847586, 76, 30177, 1373.0, 3843.2000000000085, 30000.0, 30057.08, 0.3718086653257597, 39.596791654474615, 0.0], "isController": false}, {"data": ["7.8 Year group search", 145, 0, 0.0, 1601.0482758620685, 1266, 2996, 1451.0, 2182.4, 2415.299999999999, 2867.6599999999976, 0.042233788778627955, 5.808259543288905, 0.0], "isController": false}, {"data": ["7.9 DOB search", 162, 0, 0.0, 1185.2037037037037, 641, 3198, 999.5, 1853.3000000000002, 2116.2999999999997, 3055.620000000001, 0.05085745033393253, 6.96110125137582, 0.0], "isController": false}, {"data": ["7.4 Partial name search", 144, 0, 0.0, 3088.902777777778, 1259, 9446, 1970.0, 6760.0, 7183.75, 9259.700000000004, 0.0430828147438966, 5.8083167105784765, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1627, 0, 0.0, 639.1186232329435, 303, 1928, 477.0, 1214.4, 1347.6, 1613.3200000000002, 0.45363714103207886, 37.432152215475135, 0.0], "isController": false}, {"data": ["4.2 Vaccination batch", 1591, 0, 0.0, 527.318038969203, 63, 2876, 156.0, 1696.0, 1899.3999999999992, 2307.279999999997, 0.4537678704967603, 7.572712018652398, 0.14534752101849355], "isController": false}, {"data": ["7.5 Needs Consent search", 133, 125, 93.98496240601504, 30011.23308270677, 29451, 30150, 30001.0, 30082.2, 30101.0, 30147.28, 0.0372363463696942, 0.34211303343165966, 0.0], "isController": false}, {"data": ["2.2 Session register", 1624, 0, 0.0, 310.97536945812783, 52, 1592, 125.0, 884.5, 1005.5, 1214.75, 0.4541672784221602, 18.44471598377275, 0.0], "isController": false}, {"data": ["7.6 Needs triage search", 160, 0, 0.0, 387.4124999999999, 118, 1426, 195.5, 967.6, 1026.5, 1272.2799999999966, 0.04970643689037773, 3.281983995148652, 0.0], "isController": false}, {"data": ["7.3 Last name search", 161, 0, 0.0, 2140.1490683229817, 1233, 7907, 1790.0, 3268.6000000000004, 3882.8000000000006, 6927.399999999992, 0.046629430700990945, 6.332293885607291, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.util.concurrent.TimeoutException/Non HTTP response message: Idle timeout 30000 ms elapsed", 371, 99.46380697050938, 1.4525095920444757], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, 0.5361930294906166, 0.007830240388379922], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 25542, 373, "Non HTTP response code: java.util.concurrent.TimeoutException/Non HTTP response message: Idle timeout 30000 ms elapsed", 371, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.2 Sign-in page", 2982, 71, "Non HTTP response code: java.util.concurrent.TimeoutException/Non HTTP response message: Idle timeout 30000 ms elapsed", 71, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1053, 2, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.1 Homepage", 2993, 39, "Non HTTP response code: java.util.concurrent.TimeoutException/Non HTTP response message: Idle timeout 30000 ms elapsed", 39, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.3 Sign-in", 2974, 67, "Non HTTP response code: java.util.concurrent.TimeoutException/Non HTTP response message: Idle timeout 30000 ms elapsed", 67, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.0 Open Children Search", 1345, 69, "Non HTTP response code: java.util.concurrent.TimeoutException/Non HTTP response message: Idle timeout 30000 ms elapsed", 69, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.5 Needs Consent search", 133, 125, "Non HTTP response code: java.util.concurrent.TimeoutException/Non HTTP response message: Idle timeout 30000 ms elapsed", 125, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
