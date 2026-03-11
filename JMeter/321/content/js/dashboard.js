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

    var data = {"OkPercent": 99.99042879019908, "KoPercent": 0.009571209800918835};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8606287946169612, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.4828009828009828, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9843269821757836, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9901719901719902, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.47468354430379744, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.48578199052132703, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.0, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9781710914454277, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.9255983350676379, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9796700058927519, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9734513274336283, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.47890818858560796, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9481912936848559, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.0, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.8244084682440846, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9805675508945095, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4755162241887906, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.47375, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.8723849372384938, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.987037037037037, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9840490797546012, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20896, 2, 0.009571209800918835, 268.1269142419602, 0, 11134, 108.0, 467.0, 604.0, 1799.9400000000096, 5.584500445642922, 162.9190607307074, 42.67610161326747], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 20, 0, 0.0, 110.45000000000002, 83, 357, 91.0, 135.5, 345.9499999999998, 357.0, 0.005833220071643609, 0.17803169946783534, 0.04351473939870584], "isController": false}, {"data": ["2.0 Register attendance", 1628, 2, 0.12285012285012285, 949.4920147420132, 362, 4847, 853.0, 1379.1000000000001, 1672.9499999999996, 2791.460000000001, 0.45861183156550867, 65.55686659505082, 15.792579209224888], "isController": true}, {"data": ["2.5 Select patient", 1627, 0, 0.0, 135.51382913337426, 60, 2467, 89.0, 223.0, 363.5999999999999, 849.7200000000014, 0.4584349925373996, 11.660816603003749, 3.318608854959283], "isController": false}, {"data": ["7.1 Full name search", 20, 0, 0.0, 6368.15, 4895, 8293, 5919.0, 8012.100000000001, 8281.15, 8293.0, 0.005823302936662555, 0.21240042515934743, 0.0431592618577734], "isController": false}, {"data": ["2.3 Search by first/last name", 1628, 0, 0.0, 127.63513513513496, 60, 2741, 85.0, 222.10000000000014, 334.0999999999999, 722.0400000000009, 0.45861105641394884, 13.349271599299012, 3.4420208569082797], "isController": false}, {"data": ["4.0 Vaccination for flu", 395, 0, 0.0, 862.2354430379752, 541, 4112, 738.0, 1285.6000000000001, 1516.1999999999998, 3007.2000000000066, 0.11661890212308401, 6.296656095064776, 3.339043546199242], "isController": true}, {"data": ["4.0 Vaccination for hpv", 422, 0, 0.0, 853.6374407582944, 198, 4283, 728.0, 1254.6, 1478.5999999999995, 3548.1299999999987, 0.12102912614676531, 6.048813780574911, 3.45035349664474], "isController": true}, {"data": ["7.6 First name search", 20, 0, 0.0, 8158.199999999998, 6519, 11021, 8181.0, 9770.3, 10958.5, 11021.0, 0.005822362062420379, 0.7489772270498498, 0.043102252668242975], "isController": false}, {"data": ["1.2 Sign-in page", 1695, 0, 0.0, 206.92507374631305, 11, 9671, 85.0, 242.4000000000001, 368.39999999999964, 6098.5199999999995, 0.4718577890219432, 10.036521577559084, 4.0172391251046715], "isController": false}, {"data": ["2.4 Patient attending session", 961, 2, 0.2081165452653486, 389.2268470343392, 236, 2630, 327.0, 566.6000000000001, 694.8, 1159.54, 0.270460962857914, 8.368457917639148, 2.3822482737709434], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 26.0, 26, 26, 26.0, 26.0, 26.0, 26.0, 38.46153846153847, 12.056790865384617, 22.686298076923077], "isController": false}, {"data": ["1.1 Homepage", 1697, 0, 0.0, 210.22569239835002, 29, 9567, 88.0, 232.20000000000005, 365.2999999999997, 6096.099999999997, 0.4705169947577697, 18.084706079633406, 3.9974316754806583], "isController": false}, {"data": ["1.3 Sign-in", 1695, 0, 0.0, 225.40766961651923, 60, 8535, 89.0, 310.0, 429.1999999999998, 6050.039999999994, 0.47203952544293043, 10.254996138918587, 4.180355907184776], "isController": false}, {"data": ["Run some searches", 20, 0, 0.0, 32527.950000000008, 26985, 38960, 31307.0, 38638.0, 38944.8, 38960.0, 0.005761302884079417, 3.7401402165191246, 0.3427406962520132], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 403, 0, 0.0, 820.4392059553347, 191, 6259, 705.0, 1173.0, 1523.1999999999991, 1930.9199999999985, 0.1171263755809817, 5.95849584057865, 3.344959468788291], "isController": true}, {"data": ["2.1 Open session", 1631, 0, 0.0, 305.1164929491112, 113, 3417, 242.0, 498.79999999999995, 614.3999999999999, 1112.280000000003, 0.4559888303704776, 10.601498407149379, 3.3030924062168525], "isController": false}, {"data": ["7.7 Partial name search", 20, 0, 0.0, 7346.3, 5908, 9612, 6905.0, 9137.800000000001, 9590.5, 9612.0, 0.005817851787316792, 0.749546116656655, 0.043062898068327755], "isController": false}, {"data": ["4.3 Vaccination confirm", 1606, 0, 0.0, 538.3331257783324, 353, 5943, 443.0, 769.0, 967.5999999999995, 1689.810000000001, 0.46441137015523654, 10.022736814194388, 4.804478324210176], "isController": false}, {"data": ["4.1 Vaccination questions", 1621, 0, 0.0, 167.87476866131996, 76, 2921, 107.0, 290.0, 400.4999999999993, 983.299999999999, 0.46250644827003756, 6.682491275932888, 4.351843894051785], "isController": false}, {"data": ["7.7 Last name search", 20, 0, 0.0, 8239.15, 6358, 11134, 8395.0, 9982.300000000001, 11077.05, 11134.0, 0.005820023908658217, 0.7508683384733845, 0.04310512043520975], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 36.0, 36, 36, 36.0, 36.0, 36.0, 36.0, 27.777777777777775, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1695, 0, 0.0, 1111.6536873156354, 231, 25730, 777.0, 1225.6000000000004, 1525.5999999999995, 18739.67999999999, 0.4717646754300782, 76.95792929785273, 15.572570649369464], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 400, 0, 0.0, 850.8099999999998, 193, 3936, 727.5, 1191.5000000000005, 1627.1499999999999, 2767.63, 0.11634458123658584, 6.328508391752856, 3.3228089093153614], "isController": true}, {"data": ["7.0 Open Children Search", 20, 0, 0.0, 6995.35, 2245, 10796, 6830.0, 8646.0, 10689.449999999999, 10796.0, 0.005822887558294383, 0.7410252766635844, 0.04214826647542363], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 48.0, 48, 48, 48.0, 48.0, 48.0, 48.0, 20.833333333333332, 5.9814453125, 12.858072916666666], "isController": false}, {"data": ["7.5 year group", 20, 0, 0.0, 2096.1, 1758, 4665, 1826.0, 3845.800000000004, 4633.349999999999, 4665.0, 0.005831874635690081, 0.7848740772516357, 0.043647082447981864], "isController": false}, {"data": ["7.2 No Consent search", 20, 0, 0.0, 116.6, 80, 308, 92.5, 224.20000000000002, 303.8499999999999, 308.0, 0.005834086173536643, 0.1785022415835285, 0.04362375265414458], "isController": false}, {"data": ["Debug Sampler", 1628, 0, 0.0, 0.32800982800982836, 0, 17, 0.0, 1.0, 1.0, 1.0, 0.45862462194456843, 2.5838573786060346, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1673, 0, 0.0, 480.77346084877473, 337, 3941, 421.0, 613.6000000000001, 741.5999999999999, 1348.56, 0.4671947205041794, 38.66315267851209, 3.381584791757658], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1620, 0, 0.0, 145.19444444444423, 78, 2947, 98.0, 245.9000000000001, 355.84999999999945, 682.79, 0.46311635569737464, 7.606929023809326, 4.121108540644606], "isController": false}, {"data": ["2.2 Session register", 1630, 0, 0.0, 150.8656441717789, 62, 2799, 88.0, 286.40000000000055, 393.34999999999945, 799.3500000000008, 0.4559788761491437, 18.808674607354632, 3.30702373391031], "isController": false}, {"data": ["7.3 Due vaccination", 20, 0, 0.0, 93.0, 79, 154, 89.0, 107.4, 151.69999999999996, 154.0, 0.005833749231038929, 0.1780481344289795, 0.04343892853934295], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, 100.0, 0.009571209800918835], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20896, 2, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 961, 2, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
